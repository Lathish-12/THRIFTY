# Thrifty - Personal Finance AI Advisor 💰

Thrifty is a modern, AI-powered personal finance management application that helps you track spending, set budgets, and get intelligent financial advice.

## ✨ Features

- **🚀 Smart AI Advisor**: Personalized financial coaching powered by **Google Gemini** or **Anthropic Claude**.
- **📊 Interactive Dashboard**: Visual spending analysis with beautiful charts and insights.
- **💸 Transaction Management**: Easily track income and expenses with categories.
- **🎯 Budgeting & Goals**: Set financial targets and track your progress.
- **🔒 Secure Authentication**: Google Login integration and traditional email/password.
- **🎨 Premium UI**: Stunning glassmorphism design with fluid animations.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Framer Motion, Lucide Icons, Recharts.
- **Backend**: Django, Django REST Framework, PostgreSQL/SQLite.
- **AI Models**: Google Gemini 1.5 Flash, Anthropic Claude 3.5 Sonnet.

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```

### 3. AI Configuration
Add your API keys to `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_claude_key
```

## 🤖 AI Setup Guides
- [Gemini AI Setup Guide](GEMINI_AI_SETUP.md)
- [Claude AI Setup Guide](CLAUDE_AI_SETUP.md)

---
*Built with ❤️ for better financial health.*
