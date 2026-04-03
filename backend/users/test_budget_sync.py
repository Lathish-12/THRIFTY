from django.test import TestCase
from django.contrib.auth.models import User
from .models import Budget, Transaction, Notification
from .dynamic_sync import DynamicSyncManager
from decimal import Decimal

class BudgetSyncTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password')
        self.budget = Budget.objects.create(
            user=self.user,
            category='Food',
            limit=Decimal('1000.00'),
            color='#3b82f6'
        )

    def test_budget_sync_on_expense(self):
        """Test that adding an expense triggers budget sync and notifications."""
        # 1. Add expense < 90% (₹500)
        Transaction.objects.create(
            user=self.user,
            type='expense',
            category='Food',
            amount=Decimal('500.00'),
            description='Lunch',
            date='2026-03-04'
        )
        
        # Check no warning notifications yet
        warnings = Notification.objects.filter(user=self.user, title__icontains='Warning')
        self.assertEqual(warnings.count(), 0)

        # 2. Add expense to reach 95% (₹450 more)
        Transaction.objects.create(
            user=self.user,
            type='expense',
            category='Food',
            amount=Decimal('450.00'),
            description='Dinner',
            date='2026-03-04'
        )
        
        # Check warning notification
        warnings = Notification.objects.filter(user=self.user, title__icontains='Warning')
        self.assertEqual(warnings.count(), 1)
        self.assertIn('95%', warnings.first().message)

        # 3. Add expense to exceed 100% (₹100 more)
        Transaction.objects.create(
            user=self.user,
            type='expense',
            category='Food',
            amount=Decimal('100.00'),
            description='Snacks',
            date='2026-03-04'
        )
        
        # Check critical notification
        criticals = Notification.objects.filter(user=self.user, title__icontains='Critical')
        self.assertEqual(criticals.count(), 1)
        self.assertIn('105%', criticals.first().message)

    def test_category_matching(self):
        """Test shorthand matching logic (Food matches Food & Dining)."""
        # Create a budget with shorthand name
        Budget.objects.create(
            user=self.user,
            category='Shopping',
            limit=Decimal('500.00')
        )
        
        # Add transaction with longer name
        Transaction.objects.create(
            user=self.user,
            type='expense',
            category='Shopping & Lifestyle',
            amount=Decimal('480.00'),
            description='Clothes',
            date='2026-03-04'
        )
        
        # Should trigger warning (480/500 = 96%)
        warnings = Notification.objects.filter(user=self.user, title__icontains='Warning')
        self.assertEqual(warnings.count(), 1)

    def test_sync_on_delete(self):
        """Test that deleting a transaction also triggers sync."""
        t1 = Transaction.objects.create(
            user=self.user,
            type='expense',
            category='Food',
            amount=Decimal('950.00'),
            description='Big Feast',
            date='2026-03-04'
        )
        
        # Should have 1 warning
        self.assertEqual(Notification.objects.filter(title__icontains='Warning').count(), 1)
        
        # Delete transaction
        t1.delete()
        
        # No new warnings, and spent should be 0
        self.assertEqual(self.budget.spent, 0)
