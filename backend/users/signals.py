from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Transaction, UserProfile, Badge, Goal, Budget
from django.contrib.auth.models import User
from .utils import send_instant_notification

@receiver(post_save, sender=Transaction)
def check_transaction_badges(sender, instance, created, **kwargs):
    try:
        if created:
            user = instance.user
            profile = user.profile
            
            # Send Notification
            send_instant_notification(
                user, 
                "New Transaction Recorded", 
                f"A new {instance.type} of ₹{instance.amount} for '{instance.description}' has been added to your account."
            )
            
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
        else:
            # Transaction updated
            send_instant_notification(
                instance.user,
                "Transaction Updated",
                f"Your transaction '{instance.description}' has been updated to ₹{instance.amount}."
            )
    except Exception as e:
        print(f"Error in check_transaction_badges: {e}")

@receiver(post_save, sender=Goal)
def check_goal_badges(sender, instance, created, **kwargs):
    try:
        if created:
            user = instance.user
            send_instant_notification(
                user,
                "New Goal Set",
                f"Congratulations! You've set a new goal: '{instance.name}' with a target of ₹{instance.target_amount}."
            )
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
        else:
            # Goal updated
            send_instant_notification(
                instance.user,
                "Goal Updated",
                f"Your goal '{instance.name}' has been updated. Current progress: ₹{instance.current_amount} / ₹{instance.target_amount}."
            )
    except Exception as e:
        print(f"Error in check_goal_badges: {e}")

@receiver(post_save, sender=Budget)
def check_budget_badges(sender, instance, created, **kwargs):
    try:
        if created:
            user = instance.user
            send_instant_notification(
                user,
                "Budget Created",
                f"You've set a budget of ₹{instance.limit} for the '{instance.category}' category."
            )
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
        else:
            # Budget updated
            send_instant_notification(
                instance.user,
                "Budget Updated",
                f"Your budget for '{instance.category}' has been updated to ₹{instance.limit}."
            )
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
