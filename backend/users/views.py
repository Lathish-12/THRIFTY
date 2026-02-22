from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, TransactionSerializer, BadgeSerializer, UserProfileSerializer, BudgetSerializer, GoalSerializer, PaymentSerializer
from .models import Transaction, Badge, UserProfile, Budget, Goal, Payment
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from jwt import decode as jwt_decode
from jwt.exceptions import InvalidTokenError, DecodeError
import os
from django.core.mail import send_mail
from django.conf import settings
from decouple import config
import razorpay
import uuid
from .ai_service import AIService

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
        # Check level up status
        profile.check_level_up
        serializer = UserProfileSerializer(profile, context={'request': request})
        # Add next level threshold for frontend progress bar
        data = serializer.data
        next_threshold = 100
        if profile.points > 600: next_threshold = 1000
        elif profile.points > 300: next_threshold = 600
        elif profile.points > 100: next_threshold = 300
        data['next_level_threshold'] = next_threshold
        return Response(data)

    def patch(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            profile.check_level_up # Check after update
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
    """Data-Driven Financial Advisor (No External AI)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # Get user message
            user_message = request.data.get('message', '').strip()
            if not user_message:
                return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user's financial data
            if request.user.is_authenticated:
                transactions = Transaction.objects.filter(user=request.user).order_by('-date')
                expenses = transactions.filter(type='expense')
                income = transactions.filter(type='income')
                total_expense = sum(float(t.amount) for t in expenses)
                total_income = sum(float(t.amount) for t in income)
                transaction_count = transactions.count()
                
                # Fetch Goals and Budgets
                goals = Goal.objects.filter(user=request.user)
                budgets = Budget.objects.filter(user=request.user)

                # Category breakdown
                category_summary = {}
                for t in expenses:
                    cat = t.category or 'Uncategorized'
                    category_summary[cat] = category_summary.get(cat, 0) + float(t.amount)
                
                top_categories = sorted(category_summary.items(), key=lambda x: x[1], reverse=True)
                
                recent_transactions = transactions[:5]
            else:
                transactions = Transaction.objects.none()
                expenses = transactions
                income = transactions
                total_expense = 0.0
                total_income = 0.0
                transaction_count = 0
                category_summary = {}
                top_categories = []
                recent_transactions = []
                goals = []
                budgets = []

            # Prepare financial context data
            financial_context = {
                'total_expense': total_expense,
                'total_income': total_income,
                'balance': total_income - total_expense,
                'top_categories': top_categories[:3], # Just top 3 for prompt brevity
                'user_name': request.user.first_name or request.user.username,
                'goal_count': goals.count(),
                'budget_count': budgets.count()
            }

            # Try to get AI response from Ollama
            ai_response = AIService.get_advisor_advice(user_message, financial_context)
            
            if ai_response:
                return Response({
                    'response': ai_response,
                    'type': 'text',
                    'powered_by': f"Ollama ({config('OLLAMA_MODEL', default='deepseek-r1:1.5b')})"
                })

            # Fallback to local rule-based engine if Ollama fails
            response_data = self._generate_data_response(
                user_message, 
                {
                    'total_expense': total_expense,
                    'total_income': total_income,
                    'balance': total_income - total_expense,
                    'categories': category_summary,
                    'top_categories': top_categories,
                    'count': transaction_count,
                    'recent': recent_transactions,
                    'user_name': request.user.first_name or request.user.username,
                    'goals': goals,
                    'budgets': budgets
                }
            )

            return Response({
                'response': response_data,
                'type': 'text',
                'powered_by': 'Thrifty Local Engine (Fallback)'
            })
            
        except Exception as e:
            print(f"Advisor Error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _generate_data_response(self, query, data):
        """Rule-based response generator using user data"""
        q = query.lower()
        
        # 1. Greetings
        if any(w in q for w in ['hello', 'hi', 'hey', 'start']):
            return f"Hello {data['user_name']}! 👋 I am your Thrifty Advisor. I can help you analyze your finances based on your data.\n\nTry asking:\n- \"What is my balance?\"\n- \"Show my goals\"\n- \"How is my budget?\"\n- \"Highest spending category?\""

        # 2. Balance / Financial Health
        if any(w in q for w in ['balance', 'net', 'status', 'health', 'how much do i have']):
            balance = data['balance']
            status_emoji = '🎉' if balance >= 0 else '⚠️'
            return f"**Current Financial Status:**\n\nIncome: ₹{data['total_income']:.2f}\nExpenses: ₹{data['total_expense']:.2f}\n------------------\n**Net Balance: ₹{balance:.2f}** {status_emoji}"

        # 3. Income Analysis
        if 'income' in q or 'earned' in q or 'made' in q:
            return f"You have recorded a total income of **₹{data['total_income']:.2f}** from {data['count']} total transactions."

        # 4. Expense/Spending Analysis
        if 'spend' in q or 'spent' in q or 'expense' in q or 'cost' in q:
            msg = f"Your total expenses amount to **₹{data['total_expense']:.2f}**.\n\n"
            if data['top_categories']:
                top = data['top_categories'][0]
                msg += f"Your highest spending is in **{top[0]}** (₹{top[1]:.2f})."
            else:
                msg += "You haven't recorded any expenses yet."
            return msg

        # 5. Category Breakdown
        if 'category' in q or 'breakdown' in q or 'where' in q: # "Where did my money go?"
            if not data['top_categories']:
                return "No category data available yet. Add some expenses!"
            
            msg = "**Spending by Category:**\n"
            for cat, amount in data['top_categories'][:5]:
                msg += f"- **{cat}**: ₹{amount:.2f}\n"
            return msg

        # 6. Recent Transactions
        if 'recent' in q or 'transaction' in q or 'last' in q or 'history' in q:
            if not data['recent']:
                return "No transactions found."
            
            msg = "**Last 5 Transactions:**\n"
            for t in data['recent']:
                sign = '+' if t.type == 'income' else '-'
                msg += f"- {t.date}: **{t.description}** ({sign}₹{t.amount})\n"
            return msg

        # 7. Goals Analysis
        if 'goal' in q or 'target' in q:
            goals = data.get('goals', [])
            if not goals:
                return "You haven't set any financial goals yet. Head to the **Goals** page to set one!"
            
            msg = "**Your Financial Goals:**\n\n"
            for g in goals:
                progress = (g.current_amount / g.target_amount) * 100
                msg += f"- **{g.name}**: ₹{g.current_amount} / ₹{g.target_amount} ({progress:.1f}%)\n"
            return msg

        # 8. Budget Analysis
        if 'budget' in q or 'limit' in q:
            budgets = data.get('budgets', [])
            if not budgets:
                return "No budgets set. Setting a budget helps you save more!"
            
            msg = "**Your Budgets:**\n\n"
            for b in budgets:
                # Calculating spent amount for that category:
                # Try exact match or lowercase match
                spent = data['categories'].get(b.category, data['categories'].get(b.category.lower(), 0))
                
                msg += f"- **{b.category}**: Spent ₹{spent:.2f} / ₹{b.limit:.2f}\n"
                if spent > b.limit:
                    msg += "  ⚠️ **Over Budget!**\n"
                else:
                    msg += "  ✅ On Track\n"
            return msg

        # 9. Investment or Savings Advice (Rule-Based)
        if 'invest' in q or 'save' in q or 'suggestion' in q or 'tip' in q:
            balance = data['balance']
            if balance > 5000:
                return f"Since you have a surplus of **₹{balance:.2f}**, consider:\n1. Building an emergency fund (3-6 months of expenses).\n2. Starting a Recurring Deposit (RD) or SIP.\n3. Allocating 50% to needs, 30% to wants, 20% to savings."
            elif balance > 0:
                return f"You have a small surplus of **₹{balance:.2f}**. Focus on tracking every expense and building a small safety net before aggressive investing."
            else:
                return "Your expenses currently exceed your income. ⚠️ My advice:\n1. distinct 'Needs' vs 'Wants'.\n2. Cut down on the top spending category.\n3. Avoid new debts."

        # Default fallback
        return "I can answer questions about your **balance**, **expenses**, **goals**, **budgets**, or **recent transactions**. Try asking: 'Show my goals' or 'How is my budget?'"


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


import uuid

class PaymentCreateView(APIView):
    """Create a new payment order (Simulated/Gateway)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            amount = request.data.get('amount')
            if not amount:
                return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Initialize Razorpay Client
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            
            # Create Razorpay Order (Amount in paise: 1 INR = 100 paise)
            razorpay_data = {
                "amount": int(float(amount) * 100),
                "currency": "INR",
                "receipt": f"receipt_{uuid.uuid4().hex[:10]}"
            }
            
            razorpay_order = client.order.create(data=razorpay_data)
            order_id = razorpay_order['id']
            
            payment = Payment.objects.create(
                user=request.user,
                order_id=order_id,
                amount=amount,
                status='pending',
                provider='razorpay'
            )
            
            return Response({
                'order_id': order_id,
                'amount': amount,
                'currency': 'INR',
                'key': settings.RAZORPAY_KEY_ID
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentWebhookView(APIView):
    """Simulated Webhook Handler for Payment Confirmation"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            order_id = request.data.get('order_id')
            success = request.data.get('success', False)
            payment_id = request.data.get('payment_id', f"pay_{uuid.uuid4().hex[:12]}")
            
            payment = Payment.objects.get(order_id=order_id)
            
            if success:
                payment.status = 'success'
                payment.payment_id = payment_id
                payment.save()
                
                # Auto-create budget/wallet transaction on success
                Transaction.objects.create(
                    user=payment.user,
                    type='income',
                    category='other',
                    amount=payment.amount,
                    description=f"UPI Deposit Ref: {payment_id}",
                    date=payment.created_at.date(),
                    payment_method='upi'
                )
                
                # Bonus: Add points for depositing
                profile = payment.user.profile
                profile.points += 50
                profile.save()
                profile.check_level_up
                
                # Step 5: Trigger Notification (Email)
                try:
                    send_mail(
                        'Payment Successful: Thrifty Wallet Updated',
                        f"Hello {payment.user.username},\n\nYour payment of ₹{payment.amount} (ID: {payment_id}) was successfully reconciled and added to your Thrifty wallet.\n\nTransaction Type: UPI\nRef: {payment.order_id}\n\nThank you for using Thrifty!",
                        settings.DEFAULT_FROM_EMAIL,
                        [payment.user.email],
                        fail_silently=True,
                    )
                except Exception as e:
                    print(f"Notification error: {e}")

                return Response({'status': 'Payment successful, Wallet updated and Notification triggered'})

            else:
                payment.status = 'failed'
                payment.save()
                return Response({'status': 'Payment failed'})
                
        except Payment.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """View history of UPI/Gateway transactions"""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')



