# ⚡ Quick Render Setup - Copy & Paste Ready

## 🔧 Service Configuration

### Basic Settings
```
Name: thrifty-backend
Region: Oregon (US West) or Frankfurt (EU)
Branch: main
Root Directory: backend
```

### Build Settings
```
Runtime: Python 3
Build Command: ./build.sh
Start Command: gunicorn thrifty_backend.wsgi:application --bind 0.0.0.0:$PORT
```

## 🔐 Environment Variables to Add

Copy and paste these into Render's environment variables section:

```bash
# Generate a secret key at: https://djecrety.ir/
DJANGO_SECRET_KEY=your-generated-secret-key-here

DEBUG=False

ALLOWED_HOSTS=.onrender.com

PYTHON_VERSION=3.14.2
```

### After Frontend is Deployed, Add:
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

### After Database is Created, Add:
```bash
# This will be provided by Render when you create PostgreSQL database
DATABASE_URL=postgresql://user:password@hostname/database_name
```

## 📦 PostgreSQL Database Settings

```
Name: thrifty-db
Region: Same as your web service
Instance Type: Free
```

## 🎯 Your URLs After Deployment

- **Backend API**: `https://thrifty-backend.onrender.com/api/`
- **Admin Panel**: `https://thrifty-backend.onrender.com/admin/`

## ✅ Verification Checklist

- [ ] Pushed latest code to GitHub (main branch)
- [ ] Created Web Service on Render
- [ ] Set root directory to `backend`
- [ ] Added all environment variables
- [ ] Created PostgreSQL database
- [ ] Linked DATABASE_URL to web service
- [ ] Deployment succeeded (check logs)
- [ ] Updated frontend VITE_API_URL in Vercel
- [ ] Tested API endpoint in browser
- [ ] Tested login from frontend

## 🚨 Common First-Time Issues

1. **Build fails**: Make sure root directory is set to `backend`
2. **Module not found**: Check requirements.txt has all dependencies
3. **Static files 404**: Deployment should run collectstatic automatically via build.sh
4. **CORS errors**: Update CORS_ALLOWED_ORIGINS with frontend URL (no trailing slash)
5. **Database connection**: Verify DATABASE_URL is the Internal Database URL from Render

---

**Next Step**: Go to https://render.com and click "New +" → "Web Service"
