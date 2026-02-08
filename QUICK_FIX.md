# 🚀 Quick Fix Guide - Run These Commands

## Step 1: Fix PowerShell (REQUIRED FIRST)

**Open PowerShell as Administrator** (Right-click on PowerShell → Run as Administrator)

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Press `Y` when prompted.

**Close and reopen your terminal** after this step.

---

## Step 2: Generate New Django Secret Key

```bash
cd backend
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Copy the output** and update your `backend/.env` file:
```env
DJANGO_SECRET_KEY=<paste-the-generated-key-here>
```

---

## Step 3: Get New Anthropic API Key

1. Go to: https://console.anthropic.com/
2. **Revoke the old key** (the one currently in your `.env`)
3. **Create a new API key**
4. **Copy the new key** and update `backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-<your-new-key-here>
```

---

## Step 4: Install Dependencies (if needed)

### Backend Dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Dependencies:
```bash
cd ..
npm install
```

---

## Step 5: Run the Project

### Terminal 1 - Backend:
```bash
cd backend
python manage.py runserver
```

**Expected output:**
```
System check identified no issues (0 silenced).
Starting development server at http://127.0.0.1:8000/
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

**Expected output:**
```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## Step 6: Verify Everything Works

1. **Backend:** Open http://localhost:8000/admin
2. **Frontend:** Open http://localhost:5173
3. **Test API:** Check browser console for errors (F12)

---

## Optional: Run Linting

```bash
npm run lint
```

---

## Troubleshooting

### If backend fails:
```bash
cd backend
python manage.py check
python manage.py migrate
```

### If frontend fails:
```bash
npm install --force
npm run dev
```

### If CORS errors appear:
- Verify backend is running on port 8000
- Check `VITE_API_URL` in `.env` is `http://localhost:8000/api`

---

## ✅ Success Indicators

You should see:
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:5173
- ✅ No errors in terminal
- ✅ No CORS errors in browser console
- ✅ Green "Powered by Claude 3.5 Sonnet" status in Advisor page

---

**Done!** Your project should now be running without errors. 🎉
