# Thrifty AI Advisor — Claude + Ollama Integration Guide

## 🧠 AI Engine Architecture

Your Thrifty AI Advisor now uses a **tiered AI engine**:

```
User Question
     │
     ▼
┌─────────────────────────┐
│  1️⃣  Claude AI (Primary) │  ← Anthropic API (cloud, most intelligent)
└────────────┬────────────┘
             │ if not configured / fails
             ▼
┌─────────────────────────┐
│  2️⃣  Ollama (Secondary)  │  ← Local model (private, no API key needed)
└────────────┬────────────┘
             │ if Ollama not running / fails
             ▼
┌─────────────────────────┐
│  3️⃣  Thrifty Local Engine│  ← Rule-based (always available, instant)
└─────────────────────────┘
```

Each AI message shows a **color-coded badge** indicating which engine responded.

---

## ⚙️ Configuration (`backend/.env`)

```env
# ── Claude AI (Primary) ──────────────────────────────────────────
ANTHROPIC_API_KEY=your-claude-api-key-here
CLAUDE_MODEL=claude-3-5-haiku-20241022

# ── Ollama (Secondary / Local fallback) ──────────────────────────
OLLAMA_BASE_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=deepseek-r1:1.5b
```

---

## 🚀 Setup Options

### Option A — Claude AI (Best Experience)

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Open `backend/.env` and set:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```
3. Restart the backend: `python manage.py runserver`
4. Look for the **🤖 Claude AI Active** green status in the Advisor tab.

**Recommended models:**
| Model | Speed | Cost | Quality |
|---|---|---|---|
| `claude-3-5-haiku-20241022` | ⚡ Fast | 💰 Low | ⭐⭐⭐⭐ |
| `claude-3-5-sonnet-20241022` | 🐢 Slower | 💰💰 Medium | ⭐⭐⭐⭐⭐ |

---

### Option B — Ollama (100% Local/Private)

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull the model:
   ```bash
   ollama pull deepseek-r1:1.5b
   ```
3. Ollama runs automatically in the system tray.
4. Look for the **🦙 Ollama Active** status in the Advisor tab.

**Other great models:**
```bash
ollama pull llama3.2:3b      # Meta Llama (fast, good quality)
ollama pull mistral:7b       # Mistral (excellent for reasoning)
ollama pull phi3:mini        # Microsoft Phi (very compact)
```

To use a different model, update `backend/.env`:
```env
OLLAMA_MODEL=llama3.2:3b
```

---

### Option C — Thrifty Local Engine (No Setup)

Always available with no configuration. Handles:
- Balance & net worth queries
- Category breakdowns
- Recent transaction history
- Budget status
- Goals tracking
- Savings & investment tips

---

## 🎨 UI Status Indicators

| Badge | Meaning |
|---|---|
| 🟣 `Claude AI Active` | Claude is responding (best quality) |
| 🟢 `Ollama Active` | Ollama local model is responding |
| 🟡 `Local Engine Active` | Rule-based fallback responding |

Each message bubble also shows the **model badge** (e.g., `🤖 Claude (claude-3-5-haiku-20241022)`).

---

## � Tips

- **Ask specific questions**: "Why is my Food budget over limit?" vs "Tell me about food"
- **Use follow-up questions**: The AI context includes your full transaction history
- **Try suggestions**: The smart prompt chips adapt to your data
- **Mix both**: Claude for deep analysis, Ollama for offline/private sessions

---

## 🔌 New API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/users/ai/chat/` | POST | Send a message, get AI response |
| `/api/users/ai/status/` | GET | Check which AI engines are available |

---

*Need help? Check the backend console for detailed logs starting with `[AIService]`.*
