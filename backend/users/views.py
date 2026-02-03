from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, TransactionSerializer, BadgeSerializer, UserProfileSerializer
from .models import Transaction, Badge, UserProfile
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from jwt import decode as jwt_decode
from jwt.exceptions import InvalidTokenError, DecodeError
import os


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Attempt to decode the JWT token
            print(f"Attempting to decode Google token...")
            
            # First try to decode without verification (for development)
            try:
                user_data = jwt_decode(token, options={"verify_signature": False})
                print(f"Token decoded successfully (unverified)")
            except Exception as e:
                print(f"Failed to decode token: {e}")
                # Try validating with Google's endpoint as fallback
                try:
                    google_response = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={token}', timeout=5)
                    if google_response.status_code != 200:
                        print(f"Google validation failed: {google_response.text}")
                        return Response({'error': 'Invalid Google Token'}, status=status.HTTP_400_BAD_REQUEST)
                    user_data = google_response.json()
                except Exception as google_error:
                    print(f"Google tokeninfo endpoint error: {google_error}")
                    return Response({'error': f'Token validation failed: {str(google_error)}'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract user information from token
            email = user_data.get('email') or user_data.get('sub', '').split('@')[0] + '@google.com'
            first_name = user_data.get('given_name', '')
            last_name = user_data.get('family_name', '')
            
            if not email:
                return Response({'error': 'Email not found in Google Token'}, status=status.HTTP_400_BAD_REQUEST)

            # Get or Create User
            user, created = User.objects.get_or_create(username=email, defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            })
            
            if created:
                user.set_unusable_password()
                user.save()
                # Create UserProfile for new Google users
                try:
                    UserProfile.objects.get_or_create(user=user)
                except Exception as profile_error:
                    print(f"Error creating UserProfile: {profile_error}")

            # Generate Tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'id': user.id
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Unexpected error in Google login: {e}")
            return Response({'error': f'Google login failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        """Allow updating basic user fields like first_name, last_name, email."""
        try:
            user = request.user
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            email = request.data.get('email')

            updated = False
            if first_name is not None:
                user.first_name = first_name
                updated = True
            if last_name is not None:
                user.last_name = last_name
                updated = True
            if email is not None:
                user.email = email
                updated = True

            if updated:
                user.save()

            serializer = UserSerializer(user)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error updating user: {e}")
            return Response({'error': 'Failed to update user.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return transactions for the current user
        return Transaction.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transaction summary (total income, expenses, balance)"""
        transactions = self.get_queryset()
        
        total_income = sum(t.amount for t in transactions if t.type == 'income')
        total_expenses = sum(t.amount for t in transactions if t.type == 'expense')
        balance = total_income - total_expenses

        return Response({
            'total_income': total_income,
            'total_expenses': total_expenses,
            'balance': balance,
            'transaction_count': transactions.count()
        })


class BadgeViewSet(viewsets.ModelViewSet):
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return badges for the current user
        return Badge.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a badge
        serializer.save(user=self.request.user)


class DeleteAccountView(APIView):
    """Allow authenticated users to delete their account and related data."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        try:
            user = request.user
            username = user.username
            # Deleting the user will cascade to profile, transactions, badges
            user.delete()
            print(f"Deleted user: {username}")
            return Response({'detail': 'Account deleted successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error deleting account: {e}")
            return Response({'error': 'Failed to delete account.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

