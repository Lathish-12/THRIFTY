import requests
import json
from decouple import config


class AIService:
    """
    Thrifty AI Service — Ollama-powered conversational financial advisor.
    Supports: greetings, casual chat, financial queries, and context-aware multi-turn conversation.
    """

    @staticmethod
    def _build_system_prompt(financial_data: dict) -> str:
        """Build a rich, context-aware system prompt from user's financial data."""

        name = financial_data.get('user_name', 'there')
        income = financial_data.get('total_income', 0)
        expense = financial_data.get('total_expense', 0)
        balance = financial_data.get('balance', 0)
        tx_count = financial_data.get('transaction_count', 0)
        top_cats = financial_data.get('top_categories', [])
        goals = financial_data.get('goals', [])
        budgets = financial_data.get('budgets', [])
        recent = financial_data.get('recent_transactions', [])

        # Format top categories
        cats_str = "None recorded yet"
        if top_cats:
            cats_str = ", ".join([f"{c} (₹{a:.0f})" for c, a in top_cats[:5]])

        # Format goals
        goals_str = "No goals set"
        if goals:
            goals_str = "; ".join([
                f"{g['name']}: ₹{g['current']:.0f}/₹{g['target']:.0f} ({g['progress_pct']:.0f}%)"
                for g in goals
            ])

        # Format budgets
        budgets_str = "No budgets set"
        if budgets:
            parts = []
            for b in budgets:
                spent = b.get('spent', 0)
                limit = b.get('limit', 0)
                used_pct = (spent / limit * 100) if limit else 0
                status = "OVER BUDGET!" if spent > limit else f"{used_pct:.0f}% used"
                parts.append(f"{b['category']}: spent ₹{spent:.0f} of ₹{limit:.0f} ({status})")
            budgets_str = "; ".join(parts)

        # Format recent transactions
        recent_str = "No transactions yet"
        if recent:
            parts = []
            for t in recent[:5]:
                sign = "+" if t['type'] == 'income' else "-"
                parts.append(f"{t['date']}: {t['description']} ({sign}₹{t['amount']:.0f}) [{t['category']}]")
            recent_str = "\n    ".join(parts)

        health = "healthy surplus" if balance > 0 else "deficit — spending exceeds income"

        return f"""You are Thrifty Advisor — a friendly, smart, and conversational AI financial assistant built into the Thrifty personal finance app.

PERSONALITY:
- Warm, encouraging, and natural — like a knowledgeable friend who happens to be a financial expert
- Handle ALL types of messages: greetings, small talk, financial questions, venting about money, etc.
- For greetings like "hello", "hi", "how are you" — respond warmly and briefly, then gently invite a financial question
- For casual chat — be friendly and natural, then relate it back to finances if appropriate
- For financial questions — give specific, data-driven advice using the user's REAL data below
- Always use ₹ (Indian Rupees) for amounts
- Use **bold** for key numbers and headings
- Keep responses concise (under 200 words) unless a detailed breakdown is asked for
- Never make up data — only use the financial data provided below

USER PROFILE: {name}

CURRENT FINANCIAL SNAPSHOT:
- Total Income:   ₹{income:,.2f}
- Total Expenses: ₹{expense:,.2f}
- Net Balance:    ₹{balance:,.2f} ({health})
- Transactions:   {tx_count} recorded

TOP SPENDING CATEGORIES:
    {cats_str}

FINANCIAL GOALS:
    {goals_str}

BUDGET STATUS:
    {budgets_str}

RECENT TRANSACTIONS:
    {recent_str}

GUIDELINES:
- When asked "what is my budget?" → summarize the BUDGET STATUS data above
- When asked "what is my balance?" or "how much do I have?" → give the Net Balance
- When asked about goals → use FINANCIAL GOALS data
- When asked about spending/expenses → use TOP SPENDING CATEGORIES
- When asked about recent activity → use RECENT TRANSACTIONS
- For saving tips → base them on the actual balance and top spending categories
- If data is missing (0 transactions, no budgets) → gently encourage the user to add data first
- NEVER say you don't have access to data — the data is provided above"""

    @staticmethod
    def get_ollama_response(user_message: str, financial_data: dict, history: list = None):
        """
        Send a message to Ollama with full conversation history and financial context.
        
        Args:
            user_message: The latest user message
            financial_data: Dict with income, expenses, budgets, goals, transactions
            history: List of previous messages [{"role": "user/assistant", "content": "..."}]
        
        Returns:
            (response_text, model_label) or (None, None) on failure
        """
        ollama_base = config('OLLAMA_BASE_URL', default='http://localhost:11434/api/generate')
        # Try chat endpoint first (supports multi-turn), fallback to generate
        ollama_chat_url = ollama_base.replace('/api/generate', '/api/chat')
        model = config('OLLAMA_MODEL', default='deepseek-r1:1.5b')

        system_prompt = AIService._build_system_prompt(financial_data)

        # Build messages array for chat API
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (last 10 exchanges to keep context manageable)
        if history:
            for msg in history[-10:]:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role in ('user', 'assistant') and content:
                    messages.append({"role": role, "content": content})

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        try:
            # Try /api/chat (multi-turn support)
            resp = requests.post(
                ollama_chat_url,
                json={"model": model, "messages": messages, "stream": False},
                timeout=60
            )

            if resp.status_code == 200:
                data = resp.json()
                # /api/chat returns {"message": {"role": "assistant", "content": "..."}}
                text = data.get('message', {}).get('content', '').strip()
                if text:
                    # Remove <think>...</think> reasoning blocks (deepseek-r1 specific)
                    import re
                    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
                    return text, f"Ollama · {model}"

            # Fallback to /api/generate if chat not supported
            generate_prompt = f"{system_prompt}\n\n"
            if history:
                for msg in history[-6:]:
                    role = "User" if msg.get('role') == 'user' else "Thrifty Advisor"
                    generate_prompt += f"{role}: {msg.get('content', '')}\n"
            generate_prompt += f"User: {user_message}\nThrifty Advisor:"

            resp2 = requests.post(
                ollama_base,
                json={"model": model, "prompt": generate_prompt, "stream": False},
                timeout=60
            )
            if resp2.status_code == 200:
                import re
                text = resp2.json().get('response', '').strip()
                text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
                if text:
                    return text, f"Ollama · {model}"

            return None, None

        except Exception as e:
            print(f"[Ollama] Error: {e}")
            return None, None

    @staticmethod
    def get_advisor_advice(user_message: str, financial_data: dict, history: list = None):
        """Main entry point. Returns (response_text, label) or (None, None)."""
        return AIService.get_ollama_response(user_message, financial_data, history)

    @staticmethod
    def get_status():
        """Check Ollama availability and list loaded models."""
        model = config('OLLAMA_MODEL', default='deepseek-r1:1.5b')
        ollama_url = config('OLLAMA_BASE_URL', default='http://localhost:11434/api/generate')
        base_url = ollama_url.replace('/api/generate', '')

        ollama_online = False
        available_models = []
        try:
            r = requests.get(f"{base_url}/api/tags", timeout=3)
            if r.status_code == 200:
                ollama_online = True
                available_models = [m['name'] for m in r.json().get('models', [])]
        except Exception:
            pass

        return {
            "ollama": ollama_online,
            "ollama_model": model,
            "ollama_url": ollama_url,
            "available_models": available_models,
        }
