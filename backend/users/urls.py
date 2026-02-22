from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, MeView, GoogleLoginView, UserProfileView, 
    TransactionViewSet, BadgeViewSet, DeleteAccountView, 
    AIAdvisorView, BudgetViewSet, GoalViewSet, SupportRequestView,
    PaymentViewSet, PaymentCreateView, PaymentWebhookView
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='user_me'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('delete/', DeleteAccountView.as_view(), name='delete_account'),
    path('ai/chat/', AIAdvisorView.as_view(), name='ai_chat'),
    path('support/', SupportRequestView.as_view(), name='support_request'),
    path('payments/create/', PaymentCreateView.as_view(), name='payment_create'),
    path('payments/webhook/', PaymentWebhookView.as_view(), name='payment_webhook'),
    path('', include(router.urls)),  # Include router URLs
]

