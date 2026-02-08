# Claude AI Integration Setup Guide

## 🤖 Your AI Advisor is Now Ready!

The Advisor has been upgraded to work with **Claude AI** (Anthropic's advanced language model). It now provides intelligent, context-aware financial advice based on your actual transaction data!

---

## ✨ Features

### What's New:
- **Real Claude AI Integration** - Powered by Claude 3.5 Sonnet
- **Context-Aware** - Claude sees your transaction history and provides personalized advice
- **Smart Fallback** - Works even without API key (limited features)
- **Real-Time Status** - See if you're using Claude AI or fallback mode
- **Natural Conversations** - Chat naturally like you would with a financial advisor

---

## 🚀 Setup Instructions

### Step 1: Get Your Claude API Key

1. Visit: https://console.anthropic.com/
2. Sign up or log in to your account
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key (it looks like: `sk-ant-...`)

### Step 2: Add API Key to Backend

1. Open: `backend/.env`
2. Find the line: `ANTHROPIC_API_KEY=your-claude-api-key-here`
3. Replace `your-claude-api-key-here` with your actual API key
4. Save the file

**Example:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxx-your-actual-key-here
```

### Step 3: Install Required Packages

The packages are installing automatically. If needed, run manually:

```bash
cd backend
pip install anthropic python-decouple pyjwt
```

### Step 4: Restart Backend Server

Stop the current backend server (Ctrl+C) and restart it:

```bash
cd backend
python manage.py runserver
```

---

## 💬 How to Use

### Example Questions to Ask:

1. **Financial Analysis:**
   - "Analyze my spending habits"
   - "What are my biggest expenses?"
   - "Show me my financial summary"

2. **Budget Planning:**
   - "Help me create a budget"
   - "How can I reduce my expenses?"
   - "I want to save ₹10,000 per month"

3. **Savings & Investment:**
   - "How can I save more money?"
   - "Should I invest my savings?"
   - "Give me investment advice"

4. **Specific Guidance:**
   - "Why is my food category so high?"
   - "Compare this month to last month"
   - "Am I overspending?"

### Smart Features:

- **Contextual Understanding** - Claude knows your transaction history
- **Personalized Advice** - Recommendations based on YOUR data
- **Follow-up Questions** - Continue the conversation naturally
- **Action Items** - Get concrete steps to improve your finances

---

## 🔧 Troubleshooting

### Issue: "Fallback Mode" Banner Appears

**Solution:** This means the API key is not set or invalid.
- Check if you added the API key to `.env`
- Ensure there are no spaces or quotes around the key
- Restart the backend server after adding the key

### Issue: Error Message in Chat

**Possible Causes:**
1. Backend server is not running
2. API key is invalid
3. Network connection issue
4. Claude API rate limit reached

**Solutions:**
- Verify backend is running on `http://localhost:8000`
- Check your API key is valid and active
- Check your internet connection
- Wait a few minutes if rate limited

### Issue: Slow Responses

**This is normal!** Claude AI takes 1-3 seconds to generate thoughtful responses. The typing indicator shows it's thinking.

---

## 💰 Pricing (Claude API)

- **Free Tier:** Limited requests to test the integration
- **Pay-as-you-go:** ~$0.003 per request (very affordable)
- **Monthly credits:** Some plans include free credits

Check current pricing: https://www.anthropic.com/pricing

---

## 🎯 Benefits of Claude Integration

### Without API Key (Fallback Mode):
- ✅ Basic responses
- ✅ Simple calculations
- ❌ Limited context understanding
- ❌ Generic advice

### With Claude API Key:
- ✅ **Intelligent analysis** of your spending patterns
- ✅ **Personalized recommendations** based on your data
- ✅ **Natural conversations** - ask follow-up questions
- ✅ **Trend detection** - Claude spots patterns you might miss
- ✅ **Actionable advice** - specific steps tailored to you
- ✅ **Financial education** - learn while you chat

---

## 📊 What Claude Can See

When you chat, Claude receives:
- Your total transactions count
- Total income and expenses
- Net balance
- Top 5 spending categories with amounts
- Your last 5 transactions (description, amount, category, date)

**Privacy Note:** Your data stays between:
1. Your browser
2. Your backend server
3. Anthropic's secure API

Data is not stored by Anthropic after the conversation.

---

## 🔐 Security Best Practices

1. **Never share** your API key publicly
2. **Don't commit** `.env` to Git (it's already in `.gitignore`)
3. **Rotate keys** periodically for security
4. **Monitor usage** in Anthropic console

---

## 🎨 UI Features

- **Status Indicator:** Green = Claude AI active, Orange = Fallback mode
- **Model Badge:** Shows "Powered by Claude 3.5 Sonnet" on AI messages
- **Smart Suggestions:** Context-aware quick prompts
- **Typing Indicator:** See when Claude is thinking
- **Message History:** Persistent chat during your session

---

## 🚀 Next Steps

1. ✅ Add your Claude API key
2. ✅ Restart the backend
3. ✅ Go to the Advisor page
4. ✅ Look for the green "Powered by Claude 3.5 Sonnet" status
5. ✅ Start chatting!

---

## 💡 Pro Tips

1. **Be specific** - "Analyze my food spending" vs "Tell me about food"
2. **Ask follow-ups** - Claude remembers the conversation context
3. **Use your data** - Claude gives better advice with more transactions
4. **Try suggestions** - The smart prompts are tailored to your situation
5. **Experiment** - Ask creative questions!

---

## 📝 Example Conversation

**You:** "Analyze my spending habits"

**Claude:** "Based on your transaction data, you've spent **₹15,240** over 23 transactions. Your top spending category is **Food & Dining** at ₹6,200 (40% of total spending). 

I notice you're spending quite a bit on dining out. Here are some personalized recommendations:

1. **Set a weekly limit** for dining out (suggest ₹1,200/week)
2. **Meal prep** on Sundays to reduce weekday restaurant visits  
3. **Track patterns** - you have 8 food transactions in the last week alone

Would you like me to help you create a budget plan to reduce this category by 20%?"

**You:** "Yes, help me create a budget"

**Claude:** [Provides detailed, personalized budget based on YOUR data]

---

## 🎉 Enjoy Your AI-Powered Financial Advisor!

You now have a personal finance expert available 24/7, powered by one of the world's most advanced AI models. Ask anything, learn continuously, and achieve your financial goals! 💰✨

---

**Need Help?** 
- Check the troubleshooting section above
- Verify backend console for errors
- Ensure all packages are installed
- Make sure the API key is correctly set in `.env`
