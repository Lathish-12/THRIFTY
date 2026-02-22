from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Transaction, UserProfile, Badge, Goal, Budget
from django.contrib.auth.models import User

@receiver(post_save, sender=Transaction)
def check_transaction_badges(sender, instance, created, **kwargs):
    try:
        if created:
            user = instance.user
            profile = user.profile
            
            # 1. Earn Points
            profile.points += 10
            profile.save()
            
            # 2. Check "First Transaction" Badge
            if Transaction.objects.filter(user=user).count() == 1:
                Badge.objects.get_or_create(
                    user=user,
                    name="First Steps",
                    defaults={
                        'description': "Completed your first transaction!",
                        'icon': 'footprints'
                    }
                )
                
            # 3. Check "Big Spender"
            if instance.type == 'expense' and instance.amount > 5000:
                 Badge.objects.get_or_create(
                    user=user,
                    name="Big Spender",
                    defaults={
                        'description': "Made a single expense over ₹5000",
                        'icon': 'shopping-bag'
                    }
                )
    except Exception as e:
        print(f"Error in check_transaction_badges: {e}")

@receiver(post_save, sender=Goal)
def check_goal_badges(sender, instance, created, **kwargs):
    try:
        if created:
            user = instance.user
            Badge.objects.get_or_create(
                user=user,
                name="Goal Setter",
                defaults={
                    'description': "Set your first financial goal",
                    'icon': 'target'
                }
            )
            user.profile.points += 50
            user.profile.save()
    except Exception as e:
        print(f"Error in check_goal_badges: {e}")

@receiver(post_save, sender=Budget)
def check_budget_badges(sender, instance, created, **kwargs):
    try:
        if created:
            user = instance.user
            Badge.objects.get_or_create(
                user=user,
                name="Planner",
                defaults={
                    'description': "Created a budget category",
                    'icon': 'pie-chart'
                }
            )
            user.profile.points += 30
            user.profile.save()
    except Exception as e:
        print(f"Error in check_budget_badges: {e}")

@receiver(post_save, sender=UserProfile)
def check_level_badges(sender, instance, **kwargs):
    try:
        # Check Level achievements
        if instance.level >= 5:
            Badge.objects.get_or_create(
                user=instance.user,
                name="Thrifty Master",
                defaults={
                    'description': "Reached Level 5!",
                    'icon': 'crown'
                }
            )
        elif instance.level >= 3:
            Badge.objects.get_or_create(
                user=instance.user,
                name="Consistent Saver",
                defaults={
                    'description': "Reached Level 3!",
                    'icon': 'star'
                }
            )
    except Exception as e:
        print(f"Error in check_level_badges: {e}")
