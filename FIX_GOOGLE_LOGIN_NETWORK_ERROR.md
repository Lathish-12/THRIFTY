# 🔧 FIX: Google Login Network Error

**Problem:** Network error when trying to login with Google account  
**Causes:** Multiple possible issues (CORS, ALLOWED_HOSTS, API URL configuration)  
**Fix Time:** 5-10 minutes ✅

---

## 🎯 THE FIXES

There are 3 potential causes for the network error. Follow ALL steps to ensure Google login works properly.

---

## ✅ FIX 1: Update Frontend Environment Variables in Vercel

Your frontend is still pointing to `localhost` instead of the production Railway backend.

### Steps:

1. **Go to Vercel:** https://vercel.com/dashboard

2. **Click on your THRIFTY project**

3. **Go to Settings → Environment Variables**

4. **Add/Update these variables:**

   | Variable Name | Value |
   |--------------|-------|
   | `VITE_API_URL` | `https://thrifty-production-0796.up.railway.app/api` |
   | `VITE_GOOGLE_CLIENT_ID` | `898910923504-976po0u8pf43p4kt8slc9fhutmmgb03o.apps.googleusercontent.com` |

5. **After adding/updating, click "Redeploy":**
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

6. **Wait 2-3 minutes for the new deployment to complete**

---

## ✅ FIX 2: Update Django CORS Settings on Railway

The backend needs to allow requests from your Vercel frontend.

### Steps:

1. **Go to Railway:** https://railway.com/project/8c5c37c8-7623-49ac-be12-cfae4a514f69

2. **Click THRIFTY service**

3. **Click "Variables" tab**

4. **Find or Add the variable:** `CORS_ALLOWED_ORIGINS`

5. **Set the value to:**
   ```
   https://thrifty-beryl.vercel.app,https://thrifty-beryl-git-main.vercel.app
   ```
   *(Include both your main domain and git branches)*

6. **If the variable doesn't exist, click "+ New Variable"** and create it

7. **Click "Save"**

8. **Railway will automatically redeploy (wait 2 minutes)**

---

## ✅ FIX 3: Update Django ALLOWED_HOSTS on Railway

*(You may have already done this from FIX_403_ERROR.md, but verify it's correct)*

### Steps:

1. **Still in Railway → THRIFTY → Variables tab**

2. **Find the variable:** `ALLOWED_HOSTS`

3. **Make sure it includes BOTH domains:**
   ```
   thrifty-production-0796.up.railway.app,thrifty-beryl.vercel.app,.railway.app
   ```

4. **Click "Save"** if you made changes

5. **Wait 2 minutes for redeploy**

---

## ✅ FIX 4: Verify Django CORS Settings in Backend Code

Let's check if CORS middleware is properly configured in Django.

### Check backend/thriftybackend/settings.py:

The file should have these CORS settings:

```python
# CORS Configuration
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

And in INSTALLED_APPS:
```python
INSTALLED_APPS = [
    # ...
    'corsheaders',  # Must be here
    # ...
]
```

And in MIDDLEWARE (corsheaders MUST be near the top):
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Must be here, early
    'django.middleware.common.CommonMiddleware',
    # ... rest of middleware
]
```

---

## 🧪 TESTING AFTER FIXES

### Test 1: Open Browser Console

1. Open: `https://thrifty-beryl.vercel.app`
2. Press **F12** → **Console** tab
3. Try to click "Sign in with Google"
4. Watch the console for errors

**BEFORE FIX:** You'll see errors like:
- ❌ `CORS policy: No 'Access-Control-Allow-Origin' header`
- ❌ `Network Error`
- ❌ `Failed to fetch`
- ❌ `ERR_CORS_ORIGIN_BLOCKED`

**AFTER FIX:** You'll see:
- ✅ Google popup opens successfully
- ✅ Request to `/api/users/google/` succeeds (Status 200)
- ✅ User is redirected to dashboard

### Test 2: Network Tab

1. Open: `https://thrifty-beryl.vercel.app`
2. Press **F12** → **Network** tab
3. Click "Sign in with Google"
4. Look for the request to `thrifty-production-0796.up.railway.app/api/users/google/`

**Success indicators:**
- ✅ Status: 200 OK
- ✅ Response contains: `access`, `refresh`, `user` fields
- ✅ No CORS errors

---

## 📋 COMPLETE FIX CHECKLIST

- [ ] **Vercel:** Added `VITE_API_URL` environment variable
- [ ] **Vercel:** Added `VITE_GOOGLE_CLIENT_ID` environment variable  
- [ ] **Vercel:** Redeployed the frontend
- [ ] **Vercel:** Deployment shows "Ready" (green)
- [ ] **Railway:** Added/Updated `CORS_ALLOWED_ORIGINS` variable
- [ ] **Railway:** Verified `ALLOWED_HOSTS` includes both domains
- [ ] **Railway:** Waited 2 minutes for redeploy
- [ ] **Railway:** Deployment shows "Active" (green)
- [ ] **Testing:** Opened frontend in browser
- [ ] **Testing:** Opened browser console (F12)
- [ ] **Testing:** Clicked Google Sign In button
- [ ] **Testing:** No CORS errors in console
- [ ] **Testing:** Google login succeeds!

---

## 🚨 IF IT STILL DOESN'T WORK

### Check #1: Backend Logs in Railway

1. Go to Railway → THRIFTY service → Logs tab
2. Click "Sign in with Google" on frontend
3. Watch the logs in Railway

**Look for:**
- ✅ `OPTIONS /api/users/google/` - Should return 200
- ✅ `POST /api/users/google/` - Should show token being processed
- ❌ Any `403 Forbidden` errors
- ❌ Any `CORS` related errors

### Check #2: Google OAuth Console

Your Google OAuth might need the production domains added:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `898910923504-976po0u8pf43p4kt8slc9fhutmmgb03o`
3. Click to edit it
4. Under "Authorized JavaScript origins", make sure these are added:
   ```
   https://thrifty-beryl.vercel.app
   https://thrifty-production-0796.up.railway.app
   ```
5. Under "Authorized redirect URIs", add:
   ```
   https://thrifty-beryl.vercel.app
   https://thrifty-beryl.vercel.app/
   ```
6. Click "Save"

### Check #3: Clear Browser Cache

Sometimes the browser caches CORS failures:

1. Press **Ctrl + Shift + Delete**
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page and try again

---

## 🎯 QUICK SUMMARY

**Problem:** Network error = Frontend can't reach backend  
**Root Causes:**  
1. Frontend doesn't know production API URL (still using localhost)
2. Backend CORS doesn't allow Vercel domain
3. Backend ALLOWED_HOSTS doesn't include Vercel domain
4. Google OAuth might not allow production domains

**Fixes:**  
1. ✅ Set `VITE_API_URL` in Vercel to Railway URL
2. ✅ Set `CORS_ALLOWED_ORIGINS` in Railway to allow Vercel
3. ✅ Set `ALLOWED_HOSTS` in Railway to include both domains
4. ✅ Verify Google OAuth console allows production domains

**Time:** 5-10 minutes + deployment time

---

## ✅ AFTER THESE FIXES

Your Google login should:
- ✅ Open Google popup successfully
- ✅ Accept credentials from Google
- ✅ Send token to Railway backend
- ✅ Backend validates token
- ✅ Backend returns JWT access/refresh tokens
- ✅ Frontend stores tokens in localStorage  
- ✅ User is redirected to dashboard
- ✅ All features work!

---

**Go make these changes now, then test again!** 🚀

---

## 🔍 DEBUGGING COMMANDS

If you want to test the API directly from your browser console:

```javascript
// Test if frontend can reach backend
fetch('https://thrifty-production-0796.up.railway.app/api/users/me/', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Check what API URL the frontend is using
console.log(import.meta.env.VITE_API_URL);
```

Expected results:
- ✅ API call should return data or 401 (not CORS error)
- ✅ `VITE_API_URL` should show Railway URL (not localhost)
