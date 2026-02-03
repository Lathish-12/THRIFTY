npm run devnpm run dev# THRIFTY Deployment Guide

## Prerequisites
- GitHub account (for version control)
- Vercel account (free)
- Railway account (free)
- Google OAuth credentials already configured

## Step 1: Push Code to GitHub

```bash
# Initialize git if not done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: THRIFTY app"

# Create repository on GitHub
# Then push
git remote add origin https://github.com/YOUR_USERNAME/thrifty.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Frontend to Vercel

### 2.1 Connect GitHub to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository
4. Select "Next.js" or "Vite" as framework (auto-detected)
5. Set build command: `npm run build`
6. Set output directory: `dist`

### 2.2 Set Environment Variables in Vercel
In Vercel dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-railway-backend-url.com/api
VITE_GOOGLE_CLIENT_ID=898910923504-976po0u8pf43p4kt8slc9fhutmmgb03o.apps.googleusercontent.com
```

Your frontend will be live at: `https://your-project.vercel.app`

## Step 3: Deploy Backend to Railway

### 3.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your THRIFTY repository

### 3.2 Configure Backend
Railway will auto-detect Procfile. Configure:

**Environment Variables** in Railway:
```
DEBUG=False
SECRET_KEY=generate-a-secure-random-string
ALLOWED_HOSTS=your-railway-url.com
CORS_ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
DATABASE_URL=postgresql://... (Railway auto-provides this)
```

### 3.3 Generate Secret Key
Run this locally:
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```
Copy the output and set as `SECRET_KEY` in Railway

### 3.4 Deploy
Railway auto-deploys when you push to GitHub. Your backend will be at:
`https://your-project-production.up.railway.app`

## Step 4: Update Frontend Environment Variables

After deploying backend, update in Vercel:
```
VITE_API_URL=https://your-project-production.up.railway.app/api
```

Vercel will auto-redeploy.

## Step 5: Update Google OAuth Redirect URIs

In Google Cloud Console → OAuth 2.0 credentials:
Add authorized redirect URIs:
- `https://your-vercel-url.vercel.app`
- `https://your-vercel-url.vercel.app/login`
- `https://your-vercel-url.vercel.app/signup`

## Monitoring & Logging

**Vercel Logs**: Vercel Dashboard → Project → Deployments
**Railway Logs**: Railway Dashboard → Project → Recent Deployments

## Rollback

If something breaks:
- **Vercel**: Click a previous deployment and "Redeploy"
- **Railway**: Use GitHub history to revert and push

## Cost

- **Vercel**: Free tier (perfect for small projects)
- **Railway**: Free tier with $5/month credits

Total cost: Potentially free!

## Troubleshooting

**CORS errors?**
- Update `CORS_ALLOWED_ORIGINS` in Railway

**API not responding?**
- Check Railway logs
- Verify `VITE_API_URL` in Vercel

**Google login not working?**
- Check redirect URIs in Google Console
- Verify CLIENT_ID matches in code

**Database errors?**
- Check Railway PostgreSQL is running
- Run migrations: Railway auto-runs on deploy

## Local Development Setup

For those who want to run the project locally:

### Backend (Django)
1. Navigate to the backend directory:
    ```bash
    cd C:\Users\ELCOT\THRIFTY\backend
    ```
2. Set up a virtual environment and activate it:
    ```bash
    python -m venv venv
    venv\Scripts\activate
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Apply database migrations:
    ```bash
    python manage.py migrate
    ```
5. Run the development server:
    ```bash
    python manage.py runserver 127.0.0.1:8000
    ```

### Frontend (Vite)
1. Navigate to the frontend directory:
    ```bash
    cd C:\Users\ELCOT\THRIFTY\frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```

Now you can access the frontend at `http://localhost:3000` and the backend at `http://127.0.0.1:8000`.

Remember to set up your `.env` files for both frontend and backend with the appropriate environment variables as mentioned in the deployment steps.
