# Thrifty AI Advisor: Ollama Integration Guide

Your Thrifty AI Advisor is now powered by **Ollama** using the **DeepSeek-R1** model for private, local financial analysis.

## 🚀 How it Works
1. **Local Reasoning**: All financial data processed by the advisor stays on your machine.
2. **Data-Driven**: The advisor automatically retrieves your current:
   - Total Income & Expenses
   - Top Spending Categories
   - Financial Goals & Budgets
3. **Smart Prompting**: It sends this data to the DeepSeek model to give you personalized advice (e.g., "You're spending 40% of your income on Food, try to reduce it by ₹500").

## 🛠️ Configuration
The settings are managed in `backend/.env`:
- `OLLAMA_BASE_URL`: http://localhost:11434/api/generate
- `OLLAMA_MODEL`: deepseek-r1:1.5b

## 🚦 Status Indicators
In the **Advisor** tab of the app, you will see a badge:
- **"Live Assistant" (Green)**: Connected to Ollama.
- **"Smart Data Analysis" (Orange)**: Falling back to the rule-based engine (if Ollama is off).

## 📝 Usage Tips
- Ask specific questions like: *"How can I save more based on my goals?"*
- Ask for breakdown: *"Where did my money go this month?"*
- Ask for tips: *"Give me investment advice for my current balance."*

---
*Note: Ensure Ollama is running in your system tray for the best experience.*
