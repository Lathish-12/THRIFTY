# Google Gemini AI Integration Setup Guide

## 🤖 Your AI Advisor is Now Ready with Gemini!

The Advisor has been upgraded to support **Google Gemini AI**. It provides intelligent, context-aware financial advice based on your actual transaction data!

---

## ✨ Features

### What's New:
- **Google Gemini Integration** - Powered by Gemini 1.5 Flash (faster and highly capable)
- **Context-Aware** - Gemini analyzes your transaction history for personalized advice
- **Automatic Fallback** - If Gemini is unavailable, it can fallback to Claude or Smart Data Analysis
- **Real-Time Status** - See "Powered by Google Gemini" on your messages
- **Free Tier Friendly** - Gemini 1.5 Flash has a generous free tier

---

## 🚀 Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign up or log in to your Google Account
3. Click on **"Create API key in new project"**
4. Copy the key (it looks like: `AIzaSy...`)

### Step 2: Add API Key to Backend

1. Open: `backend/.env`
2. Find the line: `GEMINI_API_KEY=...`
3. Replace the value with your actual API key
4. Save the file

**Example:**
```env
GEMINI_API_KEY=AIzaSyBATVHg0zAkVvBHWXin6jWaRtEpHXf39Yk
```

### Step 3: Install Required Packages

The packages should be installed. If not, run:

```bash
cd backend
pip install google-generativeai python-decouple
```

### Step 4: Restart Backend Server

Stop the current backend server (Ctrl+C) and restart it:

```bash
cd backend
python manage.py runserver
```

---

## 💬 How to Use

Simply go to the **Advisor** page in your Thrifty app and start chatting!

### Example Questions to Ask:
- "Analyze my spending habits"
- "How can I save ₹5000 this month?"
- "What are my most expensive categories?"
- "Give me a budget plan based on my data"

---

## 🔧 Troubleshooting

### Issue: "Powered by thrifty-local-analyzer" (Fallback Mode)
- Check if you added the Gemini API key to `.env`
- Ensure the backend server was restarted
- Check the backend console for errors (e.g., "Gemini error")

### Issue: Package not found
- Run `pip install google-generativeai` in the `backend` folder.

---

## 💰 Pricing (Gemini API)
- **Free Tier:** Gemini 1.5 Flash is free within generous rate limits (15 RPM, 1 million TPM).
- Check latest details at: https://ai.google.dev/pricing

---

## 🚀 Benefits of Gemini Integration
- ✅ **Lightning Fast** responses
- ✅ **Deep Data Analysis** of your transactions
- ✅ **Support for many languages**
- ✅ **Personalized financial coaching**

Enjoy your world-class AI financial advisor! 💰✨
