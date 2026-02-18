from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, TransactionSerializer, BadgeSerializer, UserProfileSerializer, BudgetSerializer, GoalSerializer
from .models import Transaction, Badge, UserProfile, Budget, Goal
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from jwt import decode as jwt_decode
from jwt.exceptions import InvalidTokenError, DecodeError
import os
from django.core.mail import send_mail
from django.conf import settings

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


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return budgets for the current user
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a budget
        serializer.save(user=self.request.user)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return goals for the current user
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating a goal
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


class AIAdvisorView(APIView):
    """AI Financial Advisor powered by Google Gemini or Anthropic Claude"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            from decouple import config
            import requests
            import json
            
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
            
            # Build context for AI
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
            
            # Get API keys
            gemini_key = config('GEMINI_API_KEY', default=None)
            claude_key = config('ANTHROPIC_API_KEY', default=None)
            
            system_prompt = f"""You are Thrifty AI, an expert financial advisor integrated into a personal finance app. 
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

Your goal is to help users understand their finances better and make smarter money decisions."""

            # 1. Try Gemini Integration
            if gemini_key and gemini_key != 'your-gemini-api-key-here':
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=gemini_key)
                    model = genai.GenerativeModel('gemini-flash-latest')
                    
                    full_prompt = f"{system_prompt}\n\nUser Question: {user_message}"
                    response = model.generate_content(full_prompt)
                    
                    return Response({
                        'response': response.text,
                        'type': 'text',
                        'powered_by': 'Google Gemini'
                    })
                except Exception as g_err:
                    print(f"Gemini error, trying Claude: {g_err}")

            # 2. Try Claude / OpenRouter if Gemini fails or is missing
            if claude_key and claude_key != 'your-claude-api-key-here':
                # Detect if it's an OpenRouter key
                if claude_key.startswith('sk-or-'):
                    response = requests.post(
                        url="https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {claude_key}",
                            "Content-Type": "application/json"
                        },
                        data=json.dumps({
                            "model": "anthropic/claude-3.5-sonnet",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_message}
                            ]
                        })
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        response_text = data['choices'][0]['message']['content']
                        return Response({
                            'response': response_text,
                            'type': 'text',
                            'powered_by': 'claude-3.5-sonnet (via OpenRouter)'
                        })
                
                else:
                    # Direct Anthropic API
                    import anthropic
                    client = anthropic.Anthropic(api_key=claude_key)
                    message = client.messages.create(
                        model="claude-3-5-sonnet-20241022",
                        max_tokens=1024,
                        system=system_prompt,
                        messages=[{"role": "user", "content": user_message}]
                    )
                    return Response({
                        'response': message.content[0].text,
                        'type': 'text',
                        'powered_by': 'claude-3.5-sonnet'
                    })

            # 3. Final Fallback to Smart Data Analysis
            return self._generate_mock_response(user_message, {
                'total_expense': total_expense,
                'total_income': total_income,
                'categories': top_categories,
                'transaction_count': transactions.count()
            })

            
        except Exception as e:
            print(f"AI Advisor Error: {e}")
            # Fallback to smart mock response on error
            return self._generate_mock_response(
                user_message,
                {
                    'total_expense': total_expense,
                    'total_income': total_income,
                    'categories': top_categories,
                    'transaction_count': transactions.count()
                }
            )

    
    def _generate_mock_response(self, query, insights):
        """Fallback intelligence that provides real advice based on data even without AI"""
        query_l = query.lower()
        
        # Extract data for easier access
        expense = insights['total_expense']
        income = insights['total_income']
        balance = income - expense
        categories = dict(insights['categories'])
        count = insights['transaction_count']

        response = ""
        
        if 'investment' in query_l or 'invest' in query_l:
            if balance > 0:
                response = f"Based on your current surplus of **₹{balance:.2f}**, you're in a great position to start investing! 📈\n\n**My Recommendations:**\n1. Consider a **Fixed Deposit (FD)** for safety.\n2. Look into **Mutual Funds** for long-term growth.\n3. Keep an emergency fund of at least 3 months of expenses."
            else:
                response = "I noticed your balance is currently tight. Before investing, I recommend focusing on building an **emergency fund** and reducing any high-interest debt. 🛡️"
        
        elif 'budget' in query_l or 'plan' in query_l:
            response = "Let's create a **50/30/20 Budget Plan** for you: 📋\n\n"
            response += f"1. **Needs (50%):** ₹{income * 0.5:.2f} (Rent, Bills)\n"
            response += f"2. **Wants (30%):** ₹{income * 0.3:.2f} (Dining, Leisure)\n"
            response += f"3. **Savings (20%):** ₹{income * 0.2:.2f} (Future self)\n\n"
            if expense > (income * 0.8):
                response += "⚠️ **Alert:** Your current spending is higher than typical guidelines. Let's try to cut back on discretionary categories."
        
        elif 'spending' in query_l or 'expense' in query_l or 'habits' in query_l:
            response = f"You've tracked **{count}** transactions with a total spend of **₹{expense:.2f}**. 📊\n\n"
            if categories:
                top_cat = list(categories.keys())[0]
                response += f"Your top spending category is **{top_cat}** (₹{categories[top_cat]:.2f}). "
                response += f"Try to reduce {top_cat} spending by **10%** next month to save ₹{categories[top_cat] * 0.1:.2f}."
            else:
                response += "You haven't categorized your expenses yet. Categorizing helps me give you better advice!"
        
        else:
            # General helpful response
            if count == 0:
                response = "I'm ready to help! Start by adding your first transaction in the **Transactions** tab so I can analyze your finances. 🚀"
            else:
                response = f"I've analyzed your **{count}** transactions. Your current net flow is **{'+' if balance >= 0 else ''}₹{balance:.2f}**. 💰\n\nHow can I help you today? You can ask about:\n- \"How is my spending looking?\"\n- \"Can you suggest an investment?\"\n- \"Create a budget plan for me.\""

        return Response({
            'response': response,
            'type': 'text',
            'powered_by': 'thrifty-local-analyzer'
        })


class SupportRequestView(APIView):
    """Handle customer support requests and send emails to admin"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            message = request.data.get('message', '')
            request_type = request.data.get('type', 'change_request') # Change Request or General Inquiry

            if not message:
                return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Prepare email content
            subject = f"Thrifty Support: {request_type} from {user.username}"
            email_body = f"""
            New Support Request from Thrifty App:
            
            User: {user.first_name} {user.last_name} ({user.email})
            Username: {user.username}
            Type: {request_type}
            
            Message:
            {message}
            
            ---
            Sent from Thrifty Backend
            """

            # Send Email
            try:
                # We use fail_silently=False during development to catch errors
                send_mail(
                    subject,
                    email_body,
                    settings.DEFAULT_FROM_EMAIL,
                    [settings.SUPPORT_EMAIL],
                    fail_silently=False,
                )
                email_sent = True
            except Exception as mail_err:
                print(f"Email delivery failed: {mail_err}")
                email_sent = False

            return Response({
                'detail': 'Support request submitted successfully!',
                'email_sent': email_sent
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Support Request Error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


