from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, MeView, GoogleLoginView, UserProfileView, TransactionViewSet, BadgeViewSet

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'badges', BadgeViewSet, basename='badge')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='user_me'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('', include(router.urls)),  # Include router URLs
]

