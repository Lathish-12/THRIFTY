from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, Transaction, Badge, Budget, Goal, Notification


class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'points', 'level', 'profile_picture', 'profile_picture_url', 'upi_id', 'notifications_enabled', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'profile_picture_url', 'level']
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
        return None


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        # Create UserProfile automatically
        UserProfile.objects.create(user=user)
        
        # Send Welcome Notification
        from .utils import send_instant_notification
        send_instant_notification(
            user,
            "Welcome to Thrifty! 🌟",
            f"Hi {user.first_name or user.username}, welcome to your smart financial tracking journey. We're excited to help you save and grow!"
        )
        
        return user


class TransactionSerializer(serializers.ModelSerializer):
    receipt_url = serializers.SerializerMethodField()
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'type', 'category', 'amount', 'description', 'date', 'updated_at', 'payment_method', 'source_message', 'receipt', 'receipt_url']
        read_only_fields = ['created_at', 'updated_at', 'receipt_url', 'user']

    def get_receipt_url(self, obj):
        if obj.receipt:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt.url)
        return None

    # Standard DRF save() handles creation
    # The viewset calls save(user=request.user) which will create correctly.


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'earned_at']
        read_only_fields = ['earned_at']


class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.SerializerMethodField()  # Calculated property
    
    class Meta:
        model = Budget
        fields = ['id', 'category', 'limit', 'spent', 'color', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'spent']
    
    def get_spent(self, obj):
        """Use the model property to calculate spent amount"""
        return float(obj.spent)

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'deadline', 'icon', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']





class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['created_at']
