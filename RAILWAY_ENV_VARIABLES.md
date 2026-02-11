# 🔑 Railway Environment Variables - Copy & Paste

## Use these EXACT values in Railway:

### 1. DEBUG
```
DEBUG=False
```

### 2. DJANGO_SECRET_KEY
```
DJANGO_SECRET_KEY=+6m#iq8cmx*!7d-1wsv_qqicq&*bu#6$ufcv0=)2ny5k^a34l2
```

### 3. ALLOWED_HOSTS
```
ALLOWED_HOSTS=.railway.app,.up.railway.app
```

### 4. CORS_ALLOWED_ORIGINS (Update after Vercel deployment)
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```
**NOTE:** Replace `your-app` with your actual Vercel URL after frontend deployment.

### 5. ANTHROPIC_API_KEY
```
ANTHROPIC_API_KEY=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
```
**⚠️ SECURITY NOTE:** This key is exposed. Get a new one from https://console.anthropic.com/

---

## 📋 Quick Copy Format (for Railway Variables section):

Variable Name: `DEBUG`
Value: `False`

Variable Name: `DJANGO_SECRET_KEY`
Value: `+6m#iq8cmx*!7d-1wsv_qqicq&*bu#6$ufcv0=)2ny5k^a34l2`

Variable Name: `ALLOWED_HOSTS`
Value: `.railway.app,.up.railway.app`

Variable Name: `CORS_ALLOWED_ORIGINS`
Value: `https://your-app.vercel.app` (update later)

Variable Name: `ANTHROPIC_API_KEY`
Value: `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`

---

## ✅ Checklist:

- [ ] All 5 variables added in Railway
- [ ] PostgreSQL database created
- [ ] Root directory set to `backend`
- [ ] Deployment successful
- [ ] Backend URL copied
- [ ] Admin page accessible

---

**Do NOT set DATABASE_URL** - Railway sets this automatically when you add PostgreSQL!
