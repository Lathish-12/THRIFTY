# 🔑 STEP 5: Add Environment Variables to Railway

## ✅ Your Current Status:
- PostgreSQL Database: ✅ Online
- Backend Service: ✅ Online
- **NOW:** Add configuration variables

---

## 📋 HOW TO ADD VARIABLES:

### Step 1: Click on "THRIFTY" Service
In your Railway dashboard, click on the **THRIFTY** box (the one with GitHub icon)

### Step 2: Click "Variables" Tab
At the top, you'll see tabs. Click on **"Variables"**

### Step 3: Add Each Variable

You'll see a button like **"+ New Variable"** or **"+ Add"**

For each variable below, click that button and add:

---

## 🔐 COPY & PASTE THESE 5 VARIABLES:

### Variable 1: DEBUG
```
Name: DEBUG
Value: False
```
Click "Add" or "Save"

---

### Variable 2: DJANGO_SECRET_KEY
```
Name: DJANGO_SECRET_KEY
Value: +6m#iq8cmx*!7d-1wsv_qqicq&*bu#6$ufcv0=)2ny5k^a34l2
```
Click "Add" or "Save"

---

### Variable 3: ALLOWED_HOSTS
```
Name: ALLOWED_HOSTS
Value: .railway.app,.up.railway.app
```
Click "Add" or "Save"

---

### Variable 4: CORS_ALLOWED_ORIGINS
```
Name: CORS_ALLOWED_ORIGINS
Value: http://localhost:5173
```
**NOTE:** We'll update this later with your Vercel URL
Click "Add" or "Save"

---

### Variable 5: ANTHROPIC_API_KEY
```
Name: ANTHROPIC_API_KEY
Value: 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
```
Click "Add" or "Save"

---

## ⚠️ IMPORTANT: Do NOT Add DATABASE_URL

You should already see a variable called `DATABASE_URL` that Railway added automatically.

**DO NOT delete it or change it!** Leave it as is. ✅

---

## ✅ AFTER ADDING ALL 5 VARIABLES:

You should see **6 total variables**:
1. DEBUG ✅
2. DJANGO_SECRET_KEY ✅
3. ALLOWED_HOSTS ✅
4. CORS_ALLOWED_ORIGINS ✅
5. ANTHROPIC_API_KEY ✅
6. DATABASE_URL ✅ (Railway added this automatically)

---

## 🚀 WHAT HAPPENS NEXT:

After you save the last variable, Railway will automatically:
1. Detect the configuration change
2. Restart your backend service
3. Apply the new settings
4. Redeploy with the environment variables

**This takes 1-2 minutes.** Watch for the deployment to complete!

---

## 🎯 HOW TO KNOW IT WORKED:

1. Your THRIFTY service will show "Deploying..." for 1-2 minutes
2. Then it will show "Online" again with a green dot 🟢
3. You'll see "Active" or a checkmark ✅

---

## 📍 WHERE TO FIND YOUR BACKEND URL:

Once deployment is complete:

1. Click on your **THRIFTY** service
2. Go to **Settings** tab
3. Scroll down to **"Networking"** or **"Domains"**
4. You'll see a URL like: `https://thrifty-production-xxxx.up.railway.app`

**COPY THIS URL - YOU'LL NEED IT FOR THE FRONTEND!** 📝

---

## ✅ Quick Checklist:

- [ ] Clicked on THRIFTY service
- [ ] Clicked Variables tab
- [ ] Added DEBUG = False
- [ ] Added DJANGO_SECRET_KEY
- [ ] Added ALLOWED_HOSTS
- [ ] Added CORS_ALLOWED_ORIGINS
- [ ] Added ANTHROPIC_API_KEY
- [ ] Left DATABASE_URL alone (auto-added)
- [ ] Waited for redeployment to complete
- [ ] Service shows "Online" again
- [ ] Copied backend URL from Settings

---

**Start adding the variables now! Come back when you're done or if you need help! 😊**
