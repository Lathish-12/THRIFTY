from django.contrib import admin
from .models import UserProfile, Transaction, Badge


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'points', 'created_at']
    search_fields = ['user__username', 'user__email']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'category', 'amount', 'date', 'created_at']
    list_filter = ['type', 'category', 'date']
    search_fields = ['user__username', 'description']
    date_hierarchy = 'date'


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'earned_at']
    search_fields = ['user__username', 'name']
    list_filter = ['earned_at']

