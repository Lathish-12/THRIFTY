# Backend Errors and Fixes

## Issues Found in Your Backend

### 1. ⚠️ Security Issue: Exposed API Key in `.env`

**Problem:** Your Anthropic API key is exposed in the `.env` file:
```
ANTHROPIC_API_KEY=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
```

**Why This is Critical:**
- If this file gets committed to Git, your API key becomes public
- Anyone can use your API key and bill to your account
- Potential for API abuse and unauthorized access

**Fix:**
1. **Immediately revoke this API key** at https://console.anthropic.com/
2. Create a new API key
3. Ensure `.env` is in `.gitignore` (it should be already)
4. Never share `.env` files publicly

### 2. ⚠️ Weak Django Secret Key

**Problem:** Using a default or weak secret key:
```
DJANGO_SECRET_KEY=your-secret-key-here
```

**Fix:** Generate a strong secret key:

**Option A - Using Python:**
```bash
cd backend
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Option B - Using Online Generator:**
- Visit: https://djecrety.ir/
- Copy the generated key
- Replace in `.env`

### 3. ⚠️ CORS Configuration Issue

**Problem:** In `settings.py`, you have both:
- `CORS_ALLOW_ALL_ORIGINS = True`
- `CORS_ALLOWED_ORIGINS = [...]`

This is redundant and potentially insecure.

**Fix:** In production, always use specific origins:
```python
# Development
CORS_ALLOW_ALL_ORIGINS = config('DEBUG', default=True, cast=bool)

# Production - remove CORS_ALLOW_ALL_ORIGINS and use only:
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS', 
    default='http://localhost:5173,http://localhost:3000', 
    cast=Csv()
)
```

### 4. ℹ️ Missing Static Files Configuration for Production

**Problem:** No static files collection setup for deployment.

**Fix:** Add to `settings.py`:
```python
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
```

Then run: `python manage.py collectstatic`

### 5. ℹ️ Debug Mode in Production

**Problem:** `DEBUG=True` in `.env`

**Warning:** Never deploy with `DEBUG=True`!

**Fix for Production:**
- Set `DEBUG=False` in production `.env`
- Properly configure `ALLOWED_HOSTS`
- Set up error logging

## Recommended `.env` Template

Create a new `.env.example` for documentation (without real secrets):

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:8000/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Backend Environment Variables
DJANGO_SECRET_KEY=your-generated-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Claude AI API Key
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

## Immediate Actions Required

1. ✅ **Revoke exposed API key**
2. ✅ **Generate new Django secret key**
3. ✅ **Create new Anthropic API key**
4. ✅ **Update `.env` with new secrets**
5. ✅ **Verify `.env` is in `.gitignore`**
6. ✅ **Never commit `.env` to Git**

## Check Your `.gitignore`

Ensure these are listed:
```
.env
*.env
backend/.env
db.sqlite3
__pycache__/
*.pyc
.venv/
node_modules/
```
