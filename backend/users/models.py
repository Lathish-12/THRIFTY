from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """User profile to store additional user information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    upi_id = models.CharField(max_length=50, blank=True, null=True, help_text="Your UPI VPA")
    notifications_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def check_level_up(self):
        """Logic to calculate level based on points"""
        # Level 1: 0-100
        # Level 2: 101-300
        # Level 3: 301-600
        # Level 4: 601-1000
        # Level 5: 1000+
        new_level = 1
        if self.points > 1000:
            new_level = 5
        elif self.points > 600:
            new_level = 4
        elif self.points > 300:
            new_level = 3
        elif self.points > 100:
            new_level = 2
        
        if new_level > self.level:
            old_level = self.level
            self.level = new_level
            self.save()
            
            # Send level up notification
            from .utils import send_instant_notification
            send_instant_notification(
                self.user,
                "Level Up! 🚀",
                f"Congratulations! You've reached Level {new_level} on Thrifty. Keep up the great financial habits!"
            )
            return True # Leveled up
        return False

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Transaction(models.Model):
    """Transaction model to store income and expenses"""
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    CATEGORIES = [
        ('food', 'Food & Dining'),
        ('transport', 'Transport'),
        ('shopping', 'Shopping'),
        ('entertainment', 'Entertainment'),
        ('bills', 'Bills & Utilities'),
        ('health', 'Health & Medical'),
        ('education', 'Education'),
        ('salary', 'Salary'),
        ('freelance', 'Freelance'),
        ('investment', 'Investment'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('net_banking', 'Net Banking'),
        ('other', 'Other')
    ]
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='upi')
    
    category = models.CharField(max_length=20, choices=CATEGORIES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    source_message = models.TextField(blank=True, null=True, help_text="Original SMS or notification content")

    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.type} - {self.amount}"


class Badge(models.Model):
    """Badge model to store user achievements"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='trophy')
    earned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class Budget(models.Model):
    """Budget model to store monthly spending limits by category"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=100)
    limit = models.DecimalField(max_digits=10, decimal_places=2)
    color = models.CharField(max_length=7, default='#3b82f6')  # Hex color code
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        # Ensure user can't have duplicate budgets for the same category
        unique_together = ['user', 'category']

    def __str__(self):
        return f"{self.user.username} - {self.category} - ₹{self.limit}"
    
    @property
    def spent(self):
        """Calculate total spent in this category"""
        from django.db.models import Sum
        # Try exact match first (case-insensitive)
        total = Transaction.objects.filter(
            user=self.user,
            category__iexact=self.category,
            type='expense'
        ).aggregate(Sum('amount'))['amount__sum']
        
        if total:
            return total

        # Fallback to matching if the budget category is one of the shorthand keys
        total = Transaction.objects.filter(
            user=self.user,
            category__icontains=self.category.split()[0],
            type='expense'
        ).aggregate(Sum('amount'))['amount__sum']
        
        return total or 0


class Goal(models.Model):
    """Goal model to store user savings goals"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline = models.DateField()
    icon = models.CharField(max_length=50, default='Target')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['deadline']

    def __str__(self):
        return f"{self.user.username} - {self.name} - ₹{self.target_amount}"





class Notification(models.Model):
    """Notification model for in-app alerts"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"
