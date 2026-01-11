from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, TransactionSerializer, BadgeSerializer, UserProfileSerializer
from .models import Transaction, Badge, UserProfile
from rest_framework_simplejwt.tokens import RefreshToken
import requests


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate token with Google
        print(f"Received Google Token: {token[:20]}...")
        try:
            google_response = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={token}')
            print(f"Google Response Status: {google_response.status_code}")
            if google_response.status_code != 200:
                print(f"Google Response Content: {google_response.text}")
                return Response({'error': 'Invalid Google Token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error validating token: {e}")
            return Response({'error': 'Token validation failed'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data = google_response.json()
        email = user_data.get('email')
        name = user_data.get('name', '')
        # Basic parsing of name
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
            UserProfile.objects.create(user=user)

        # Generate Tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name   
            }
        })


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


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

