from .models import Budget
from .utils import send_instant_notification
from .ai_service import AIService

class DynamicSyncManager:
    """
    7.1.2 Dynamic Sync: The real-time relationship between Transactions and Budgets.
    This manager handles the recalculation of spent totals and triggers alerts.
    """

    @staticmethod
    def sync_budgets(transaction):
        """
        Main entry point for syncing budgets when a transaction is added, updated, or deleted.
        """
        try:
            user = transaction.user
            category = transaction.category
            
            # Find budgets that match this category
            # We fetch all user budgets to apply the matcher logic (Section 6.3.3)
            budgets = Budget.objects.filter(user=user)
            
            for budget in budgets:
                if DynamicSyncManager.is_matching_category(budget.category, category):
                    DynamicSyncManager.process_budget_alert(budget)
        except Exception as e:
            print(f"Error in DynamicSyncManager.sync_budgets: {e}")

    @staticmethod
    def is_matching_category(budget_category, transaction_category):
        """
        Matcher logic as per Section 6.3.3: Exact match or Shorthand match.
        """
        b_cat = budget_category.lower()
        t_cat = transaction_category.lower()
        
        return b_cat == t_cat or b_cat in t_cat or t_cat in b_cat

    @staticmethod
    def process_budget_alert(budget):
        """
        Calculates spent percentage and triggers notifications based on thresholds.
        """
        spent = budget.spent
        limit = budget.limit
        
        if limit <= 0:
            return

        percentage = (spent / limit) * 100
        
        # 7.5.1 Alert Triggers & 7.5.2 AI Proactive Advice
        if percentage >= 100:
            ai_advice = DynamicSyncManager.get_ai_proactive_advice(budget, spent)
            message = (
                f"CRITICAL: You've spent ₹{spent} which is {percentage:.0f}% of your "
                f"₹{limit} '{budget.category}' budget. Stop all non-essential spending!"
            )
            if ai_advice:
                message += f"\n\n**AI Advisor Tip:** {ai_advice}"
            
            send_instant_notification(budget.user, "Budget Critical Breach! 🔴", message)
            
        elif percentage >= 90:
            send_instant_notification(
                budget.user, 
                "Budget Warning ⚠️", 
                f"WARNING: You've reached {percentage:.0f}% of your '{budget.category}' budget (₹{spent}/₹{limit}). It's time to slow down."
            )

    @staticmethod
    def get_ai_proactive_advice(budget, spent):
        """
        Fetches personalized financial advice when a budget is breached.
        """
        try:
            financial_context = {
                'total_expense': float(spent),
                'budget_limit': float(budget.limit),
                'category': budget.category,
                'over_amount': float(spent - budget.limit)
            }
            return AIService.get_advisor_advice(
                f"I've spent ₹{spent} on {budget.category}, which is over my ₹{budget.limit} budget. Give me 1 quick tip.",
                financial_context
            )
        except:
            return "Consider skipping non-essential spending to stay on track."
