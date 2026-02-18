# ✅ INTERACTIVE FIX CHECKLIST - Google Login Network Error

**Status:** Ready to Execute  
**Time Required:** 10 minutes  
**Last Updated:** 2026-02-11

---

## 📌 WHAT WE JUST DID

✅ **Updated Local `.env` file**
- Changed `VITE_API_URL` from `http://localhost:8000/api`  
- To: `https://thrifty-production-0796.up.railway.app/api`

**Note:** This `.env` is for reference. The **actual fix** needs to be done in Vercel's dashboard (where your production environment variables live).

---

## 🚀 NOW DO THESE STEPS

### ✅ STEP 1: Configure Vercel Environment Variables

**Open this URL:** https://vercel.com/dashboard

1. **Login to Vercel** (if not already logged in)

2. **Find and click your THRIFTY project**

3. **Click "Settings"** (top navigation)

4. **Click "Environment Variables"** (left sidebar)

5. **Add/Update these variables:**

   #### Variable 1: VITE_API_URL
   ```
   Name: VITE_API_URL
   Value: https://thrifty-production-0796.up.railway.app/api
   Environments: ✓ Production  ✓ Preview  ✓ Development
   ```

   #### Variable 2: VITE_GOOGLE_CLIENT_ID
   ```
   Name: VITE_GOOGLE_CLIENT_ID
   Value: 898910923504-976po0u8pf43p4kt8slc9fhutmmgb03o.apps.googleusercontent.com
   Environments: ✓ Production  ✓ Preview  ✓ Development
   ```

6. **Click "Save"** for each variable

7. **Important:** After adding variables, you MUST redeploy:
   - Click "Deployments" tab (top navigation)
   - Find the latest deployment
   - Click the **three dots (...)** → **"Redeploy"**
   - Confirm redeploy

8. **Wait 2-3 minutes** for deployment to complete
   - Status should show **"Ready" (green)**

**✅ Mark when done:** [ ]

---

### ✅ STEP 2: Configure Railway Environment Variables

**Open this URL:** https://railway.com/project/8c5c37c8-7623-49ac-be12-cfae4a514f69

1. **Login to Railway** (if not already logged in)

2. **Click the "THRIFTY" service** (your backend)

3. **Click "Variables" tab**

4. **Add/Update these variables:**

   #### Variable 1: CORS_ALLOWED_ORIGINS
   ```
   Name: CORS_ALLOWED_ORIGINS
   Value: https://thrifty-beryl.vercel.app,https://thrifty-beryl-git-main.vercel.app
   ```
   
   **How to add:**
   - If it exists: Click on it → Edit → Update value → Save
   - If it doesn't exist: Click "+ New Variable" → Enter name and value → Add

   #### Variable 2: ALLOWED_HOSTS (Verify/Update)
   ```
   Name: ALLOWED_HOSTS
   Value: thrifty-production-0796.up.railway.app,thrifty-beryl.vercel.app,.railway.app
   ```
   
   **Note:** You may have already set this from the 403 error fix. Just verify it includes ALL three domains.

5. **Click "Save"** (if you made changes)

6. **Railway will automatically redeploy**
   - Click "Deployments" tab
   - Wait for status to show **"Active" or "Success" (green)**
   - This takes 1-2 minutes

**✅ Mark when done:** [ ]

---

### ✅ STEP 3: Configure Google OAuth Console (If Needed)

**Open this URL:** https://console.cloud.google.com/apis/credentials

1. **Login with the Google account** that created the OAuth app

2. **Find your OAuth 2.0 Client ID:**
   - Look for: `898910923504-976po0u8pf43p4kt8slc9fhutmmgb03o`
   - Click on it to edit

3. **Add Authorized JavaScript origins:**
   ```
   https://thrifty-beryl.vercel.app
   https://thrifty-production-0796.up.railway.app
   ```
   
   **How:**
   - Scroll to "Authorized JavaScript origins"
   - Click "+ ADD URI"
   - Paste each URL
   - Click "ADD URI" again for the second URL

4. **Add Authorized redirect URIs:**
   ```
   https://thrifty-beryl.vercel.app
   https://thrifty-beryl.vercel.app/
   ```
   
   **Note:** Include both with and without trailing slash

5. **Click "SAVE"** at the bottom

**✅ Mark when done:** [ ]

---

## 🧪 TESTING YOUR FIX

### After completing ALL steps above, test your Google login:

**Open this URL:** https://thrifty-beryl.vercel.app

1. **Press F12** to open Developer Tools

2. **Click "Console" tab**

3. **Click "Sign in with Google" button**

4. **Watch the Console for:**
   
   **❌ BEFORE FIX (What you saw):**
   - `Failed to load resource: net::ERR_FAILED`
   - `CORS policy: No 'Access-Control-Allow-Origin' header`
   - `Network Error`
   - Error messages in red

   **✅ AFTER FIX (What you should see):**
   - Google popup opens successfully
   - `POST https://thrifty-production-0796.up.railway.app/api/users/google/` → Status 200
   - `{access: "...", refresh: "...", user: {...}}`
   - You're redirected to the dashboard
   - No red error messages

5. **Also check Network tab:**
   - Press F12 → Click "Network" tab
   - Try Google login again
   - Look for: `google/` request
   - Status should be: **200 OK** (green)
   - Response should show: `access`, `refresh`, `user` data

---

## 🎯 QUICK TEST COMMANDS

**Paste these in browser console (F12 → Console) to debug:**

### Test 1: Check Frontend Environment
```javascript
// This should show the Railway URL, not localhost
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Google Client:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

**Expected Output:**
```
API URL: https://thrifty-production-0796.up.railway.app/api
Google Client: 898910923504-976po0u8pf43p4kt8slc9fhutmmgb03o...
```

### Test 2: Test Backend Connectivity
```javascript
// Test if frontend can reach backend
fetch('https://thrifty-production-0796.up.railway.app/api/users/me/')
  .then(response => {
    console.log('Status:', response.status);
    console.log('CORS works:', response.headers.has('access-control-allow-origin'));
    return response.json();
  })
  .then(data => console.log('Response:', data))
  .catch(error => console.error('Error:', error));
```

**Expected Output:**
```
Status: 401 (or 200 if logged in)
CORS works: true
Response: {...} or {detail: "Authentication credentials were not provided."}
```

**Note:** 401 is OK! It means the backend is reachable. CORS errors would show "Failed to fetch" or CORS policy messages.

---

## ✅ COMPLETION CHECKLIST

- [ ] Step 1: Vercel environment variables added
- [ ] Step 1: Vercel redeployed (Status: Ready ✓)
- [ ] Step 2: Railway CORS_ALLOWED_ORIGINS added
- [ ] Step 2: Railway ALLOWED_HOSTS verified
- [ ] Step 2: Railway redeployed (Status: Active ✓)
- [ ] Step 3: Google OAuth origins updated
- [ ] Testing: Opened browser console
- [ ] Testing: Google login button clicked
- [ ] Testing: No CORS/network errors
- [ ] Testing: Login successful!

---

## 📞 IF YOU GET STUCK

### Problem: Can't find Vercel project
**Solution:** Check if you're in the right Vercel account. The project might be under a different team.

### Problem: Railway variable doesn't save
**Solution:** Make sure you're clicking the checkmark/save icon after typing the value.

### Problem: Still getting CORS errors after all steps
**Solution:**
1. Hard refresh the page: **Ctrl + Shift + R**
2. Clear browser cache: **Ctrl + Shift + Delete**
3. Wait 5 minutes for DNS/CDN propagation
4. Check Railway logs for any error messages

### Problem: Google OAuth console doesn't show my client
**Solution:** Make sure you're logged in with the Google account that created the project. Check the project dropdown at the top.

---

## 🎉 SUCCESS INDICATORS

You'll know it's working when:
1. ✅ Google popup opens without errors
2. ✅ Browser console shows no red network errors
3. ✅ You see a 200 status code for the `/api/users/google/` request
4. ✅ You're automatically logged in and redirected to dashboard
5. ✅ All app features work (transactions, AI advisor, etc.)

---

**Start with Step 1 now!** 🚀

Each step should take 2-3 minutes. After completing all steps, wait 5 minutes total for all deployments to propagate, then test!
