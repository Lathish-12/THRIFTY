from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, MeView, GoogleLoginView, UserProfileView, 
    TransactionViewSet, BadgeViewSet, DeleteAccountView, 
    AIAdvisorView, AIStatusView, BudgetViewSet, GoalViewSet, SupportRequestView,
    NotificationViewSet, PasswordResetView
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'goals', GoalViewSet, basename='goal')

router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='user_me'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('delete/', DeleteAccountView.as_view(), name='delete_account'),
    path('ai/chat/', AIAdvisorView.as_view(), name='ai_chat'),
    path('ai/status/', AIStatusView.as_view(), name='ai_status'),
    path('support/', SupportRequestView.as_view(), name='support_request'),

    path('', include(router.urls)),  # Include router URLs
]

