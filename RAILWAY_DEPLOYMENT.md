# 🚂 Railway Backend Deployment - Step-by-Step

## What You're Doing Now:
Deploying your Django backend to Railway so it's accessible on the internet.

---

## 📋 **Follow These Steps:**

### Step 1: Create Railway Account (3 minutes)

1. I'll open Railway for you in a moment
2. Click **"Sign up with GitHub"**
3. Authorize Railway to access your GitHub account
4. Verify your email if prompted

---

### Step 2: Create New Project (2 minutes)

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **"Lathish-12/THRIFTY"** repository
4. Click **"Deploy Now"**

---

### Step 3: Configure Root Directory (IMPORTANT!)

Railway might try to deploy the entire repo. We need to tell it to use the `backend` folder:

1. In your Railway project, click **"Settings"**
2. Find **"Root Directory"**
3. Set it to: `backend`
4. Click **"Save"**

---

### Step 4: Add PostgreSQL Database (2 minutes)

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway automatically provisions it and adds `DATABASE_URL` to your environment

---

### Step 5: Set Environment Variables (IMPORTANT - 5 minutes)

Click on your backend service → **"Variables"** tab → Add these:

```
DEBUG=False
DJANGO_SECRET_KEY=your-django-secret-key-here
ALLOWED_HOSTS=.railway.app,.up.railway.app
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

**IMPORTANT:** Replace:
- `DJANGO_SECRET_KEY` - Get from your local `.env` or generate a new one
- `ANTHROPIC_API_KEY` - Use your API key (get new one from console.anthropic.com)
- `CORS_ALLOWED_ORIGINS` - We'll update this after deploying frontend

**Leave `DATABASE_URL` alone** - Railway sets this automatically!

---

### Step 6: Generate New Django Secret Key (if needed)

If you don't have one, run this locally:

```bash
cd backend
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and use it for `DJANGO_SECRET_KEY` in Railway.

---

### Step 7: Wait for Deployment (3-5 minutes)

1. Railway will automatically detect your `Procfile`
2. It will install dependencies from `requirements.txt`
3. It will run migrations (from `release:` command in Procfile)
4. It will start your Django app with Gunicorn

Watch the **"Deployment Logs"** tab to see progress.

---

### Step 8: Get Your Backend URL

Once deployed (you'll see green checkmark ✓):

1. Click on your backend service
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Copy the URL (looks like: `https://your-app-production.up.railway.app`)

**SAVE THIS URL - YOU'LL NEED IT FOR FRONTEND!**

---

### Step 9: Test Your Backend

Open in browser:
```
https://your-backend-url.railway.app/admin
```

You should see the Django admin login page. If you see it, **backend is live!** ✅

---

## ⚠️ Common Issues:

**Issue: Build fails**
- Check logs for error messages
- Verify `requirements.txt` has all dependencies
- Check `Procfile` syntax

**Issue: Database connection error**
- Verify PostgreSQL database is created
- Check that `DATABASE_URL` is automatically set

**Issue: Static files not loading**
- Django serves static files in production mode
- Check `STATIC_ROOT` in `settings.py`

---

## 🎯 What You'll Have After This Step:

✅ Backend live on Railway
✅ PostgreSQL database created
✅ Migrations run automatically
✅ Backend URL ready for frontend

---

## 📞 Ready?

Once you have your Railway backend URL, come back and I'll help you deploy the frontend to Vercel!

---

**Backend URL to save:** `____________________________`

Write it down!
