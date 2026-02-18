# 🔧 Budget Debugging Guide

## Let's Debug This Together!

Follow these steps to find the exact error:

---

## Step 1: Open Browser Developer Tools

1. Open your browser: **http://localhost:5173/**
2. Press **F12** to open Developer Tools
3. Click the **Console** tab

---

## Step 2: Try Adding a Budget

1. Login to your account
2. Go to **Budget** page
3. Click **"Add Budget"**
4. Fill in:
   - Category: "Test"
   - Limit: 1000
   - Color: Blue
5. Click **"Add Budget"**

---

## Step 3: Check Console Output

Look in the Console tab for messages like:

```
Adding budget: {category: "Test", limit: 1000, color: "#3b82f6"}
Error adding budget: ...
Error response: ...
Error data: ...
```

**Copy the error messages and send them to me!**

---

## Step 4: Check Network Tab

1. In Developer Tools, click **Network** tab
2. Try adding a budget again
3. Look for a request to: `/api/users/budgets/`
4. Click on it
5. Check the **Response** tab

**What does the response say?**

---

## Common Issues & Solutions

### Issue 1: "Authentication credentials were not provided"
**Solution**: You need to login first

### Issue 2: "UNIQUE constraint failed"
**Solution**: You already have a budget with that category name. Try a different category.

###Issue 3: Network timeout
**Solution**: Backend server might not be running. Check if you see:
```
Watching for file changes...
```

### Issue 4: 500 Internal Server Error
**Solution**: Check the backend terminal for error details

---

## Quick Backend Check

Open a new terminal and run:

```bash
cd c:\Users\ELCOT\THRIFTY\backend
python manage.py shell
```

Then paste:

```python
from users.models import Budget
from django.contrib.auth.models import User

# Check if Budget model exists
print("Budget model:", Budget)

# Try to get a user
user = User.objects.first()
print("User:", user)

# Try to create a test budget
if user:
    try:
        budget = Budget.objects.create(
            user=user,
            category="Test Category",
            limit=1000,
            color="#3b82f6"
        )
        print("SUCCESS! Budget created:", budget)
    except Exception as e:
        print("ERROR:", e)
```

**What output do you get?**

---

## Alternative: Test API Directly

Open a new terminal:

```bash
# First, login to get token (replace with your credentials)
curl -X POST http://localhost:8000/api/users/login/ ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"your_email@test.com\",\"password\":\"your_password\"}"

# Copy the "access" token from response

# Then try to create budget (replace YOUR_TOKEN_HERE)
curl -X POST http://localhost:8000/api/users/budgets/ ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"category\":\"Test\",\"limit\":1000,\"color\":\"#3b82f6\"}"
```

**What response do you get?**

---

## What I Need to Help You

Please send me:

1. ✅ Error messages from Browser Console (F12 → Console)
2. ✅ Response from Network tab (F12 → Network → /budgets/ → Response)
3. ✅ Any errors from the backend terminal

With this information, I can fix the exact issue!

---

## Temporary Workaround

I've simplified the `spent` calculation to just return 0 for now. This should at least let you add budgets even if spent tracking doesn't work yet.

Try adding a budget again and tell me what happens!
