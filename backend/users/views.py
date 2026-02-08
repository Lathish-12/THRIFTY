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


class ClaudeAIView(APIView):
    """AI Financial Advisor powered by Claude AI"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            import anthropic
            from decouple import config
            
            # Get user message
            user_message = request.data.get('message', '')
            if not user_message:
                return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user's financial data for context
            transactions = Transaction.objects.filter(user=request.user)
            
            # Calculate financial summary
            expenses = transactions.filter(type='expense')
            income = transactions.filter(type='income')
            total_expense = sum(float(t.amount) for t in expenses)
            total_income = sum(float(t.amount) for t in income)
            
            # Category breakdown
            category_summary = {}
            for t in expenses:
                cat = t.category or 'Uncategorized'
                category_summary[cat] = category_summary.get(cat, 0) + float(t.amount)
            
            top_categories = sorted(category_summary.items(), key=lambda x: x[1], reverse=True)[:5]
            
            # Build context for Claude
            financial_context = f"""
User's Financial Summary:
- Total Transactions: {transactions.count()}
- Total Income: ₹{total_income:.2f}
- Total Expenses: ₹{total_expense:.2f}
- Net Balance: ₹{total_income - total_expense:.2f}

Top Spending Categories:
{chr(10).join([f"- {cat}: ₹{amount:.2f}" for cat, amount in top_categories])}

Recent Transactions (last 5):
{chr(10).join([f"- {t.description}: ₹{t.amount} ({t.category}, {t.date})" for t in transactions.order_by('-date')[:5]])}
"""
            
            # Get API key
            api_key = config('ANTHROPIC_API_KEY', default=None)
            
            if not api_key or api_key == 'your-claude-api-key-here':
                # Fallback to smart mock responses if no API key
                return self._generate_mock_response(user_message, {
                    'total_expense': total_expense,
                    'total_income': total_income,
                    'categories': top_categories,
                    'transaction_count': transactions.count()
                })
            
            # Initialize Claude client
            client = anthropic.Anthropic(api_key=api_key)
            
            # Create message with Claude
            message = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                system=f"""You are Thrifty AI, an expert financial advisor integrated into a personal finance app. 
You provide personalized financial advice based on the user's actual transaction data.

{financial_context}

Guidelines:
- Be friendly, encouraging, and supportive
- Provide specific, actionable advice based on their data
- Use their actual numbers when giving recommendations
- Format currency as ₹ (Indian Rupees)
- Keep responses concise but informative
- Highlight insights with **bold text** for emphasis
- When appropriate, suggest concrete next steps
- Be honest about limitations and encourage professional advice for complex situations

Your goal is to help users understand their finances better and make smarter money decisions.""",
                messages=[
                    {"role": "user", "content": user_message}
                ]
            )
            
            # Extract response
            response_text = message.content[0].text
            
            return Response({
                'response': response_text,
                'type': 'text',
                'powered_by': 'claude-3.5-sonnet'
            })
            
        except Exception as e:
            print(f"Claude AI Error: {e}")
            # Fallback to mock response on error
            return self._generate_mock_response(
                user_message,
                {
                    'total_expense': 0,
                    'total_income': 0,
                    'categories': [],
                    'transaction_count': 0
                }
            )
    
    def _generate_mock_response(self, query, insights):
        """Fallback mock responses when Claude API is not available"""
        lowerQuery = query.lower()
        
        if 'spending' in lowerQuery or 'expense' in lowerQuery:
            return Response({
                'response': f"You've spent **₹{insights['total_expense']:.0f}** in total. To get more detailed AI-powered insights, please add your Claude API key to the backend .env file.",
                'type': 'text',
                'powered_by': 'fallback'
            })
        
        if 'save' in lowerQuery or 'saving' in lowerQuery:
            return Response({
                'response': "💡 **Smart Saving Tips:**\n\n1. Track every expense\n2. Follow the 50/30/20 rule\n3. Automate your savings\n\n*For AI-powered personalized advice, add your Claude API key.*",
                'type': 'text',
                'powered_by': 'fallback'
            })
        
        return Response({
            'response': f"I can help you with financial insights! However, for the best AI-powered experience, please add your Claude API key to the backend .env file.\n\nYour current stats:\n- **{insights['transaction_count']}** transactions tracked\n- **₹{insights['total_expense']:.0f}** in expenses\n\nTry asking about budgets, savings, or spending patterns!",
            'type': 'text',
            'powered_by': 'fallback'
        })

