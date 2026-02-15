# 🚀 Deploying THRIFTY Backend to Render

## Prerequisites
- GitHub account with your THRIFTY repository
- Render account (sign up at https://render.com)

## Step-by-Step Deployment Guide

### 1. **Sign Up / Log In to Render**
   - Go to https://render.com
   - Sign up or log in with your GitHub account

### 2. **Create a New Web Service**
   - Click "New +" button in the top right
   - Select "Web Service"

### 3. **Connect Your Repository**
   - Connect your GitHub account if not already connected
   - Select your `THRIFTY` repository
   - Render will scan the repository

### 4. **Configure the Service**

   Fill in the following details:

   **Basic Settings:**
   - **Name**: `thrifty-backend` (or any name you prefer)
   - **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   
   **Build & Deploy Settings:**
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn thrifty_backend.wsgi:application --bind 0.0.0.0:$PORT`

   **Instance Type:**
   - **Free** (for testing) or **Starter** ($7/month for better performance)

### 5. **Add Environment Variables**

   Click on "Advanced" and add these environment variables:

   ```
   DJANGO_SECRET_KEY=your-secret-key-here-generate-a-long-random-string
   DEBUG=False
   ALLOWED_HOSTS=.onrender.com
   PYTHON_VERSION=3.14.2
   ```

   **Optional but recommended:**
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

### 6. **Create a PostgreSQL Database** (Free tier available)

   - Click "New +" → "PostgreSQL"
   - **Name**: `thrifty-db`
   - **Region**: Same as your web service
   - **Instance Type**: Free
   - Click "Create Database"

### 7. **Connect Database to Web Service**

   After database is created:
   - Go to your web service dashboard
   - Click "Environment" in the sidebar
   - Click "Add Environment Variable"
   - Add: `DATABASE_URL` = (copy the Internal Database URL from your PostgreSQL database)
   
   The DATABASE_URL will look like:
   ```
   postgresql://user:password@hostname/database
   ```

### 8. **Deploy**

   - Click "Create Web Service"
   - Render will automatically:
     - Install dependencies from requirements.txt
     - Run build.sh (collect static files, run migrations)
     - Start gunicorn server
   
   - Watch the deployment logs for any errors

### 9. **Get Your Backend URL**

   Once deployed successfully:
   - Your backend URL will be: `https://thrifty-backend.onrender.com`
   - Copy this URL for frontend configuration

### 10. **Update Frontend Environment Variables**

   Update your Vercel frontend with the new backend URL:
   
   In Vercel dashboard:
   - Go to your project settings
   - Environment Variables
   - Update `VITE_API_URL` to: `https://thrifty-backend.onrender.com/api`
   - Redeploy frontend

### 11. **Update CORS Settings**

   After your frontend is deployed, update the backend environment variable:
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
   
   This ensures your frontend can communicate with the backend.

## 🔧 Environment Variables Summary

Here's a complete list of environment variables to set in Render:

```bash
# Required
DJANGO_SECRET_KEY=your-very-long-random-secret-key-here
DEBUG=False
ALLOWED_HOSTS=.onrender.com
DATABASE_URL=postgresql://... (Auto-set by Render when you link database)

# Optional but Recommended
PYTHON_VERSION=3.14.2
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

## 🎯 Testing Your Deployment

1. **Check Health**: Visit `https://thrifty-backend.onrender.com/api/` in browser
2. **Test Login**: Try logging in from your frontend
3. **Check Logs**: Monitor logs in Render dashboard for any errors

## ⚠️ Important Notes

1. **Free Tier Limitations**:
   - Free services spin down after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds
   - Upgrade to Starter plan for always-on service

2. **Database**: 
   - Free PostgreSQL has 90-day expiration
   - Export data before expiration or upgrade

3. **Static Files**:
   - WhiteNoise serves static files automatically
   - No need for separate CDN on free tier

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `build.sh` has execute permissions
- Ensure all dependencies in requirements.txt

### Database Connection Issues
- Verify DATABASE_URL is set correctly
- Check database is in same region as web service
- Ensure database is running

### CORS Errors
- Update CORS_ALLOWED_ORIGINS with exact frontend URL
- Include both http:// and https:// if needed
- Add your custom domain if you have one

### Application Errors
- Check application logs in Render dashboard
- Set DEBUG=True temporarily to see detailed errors (don't forget to disable)
- Verify all secret keys and environment variables are set

## 📚 Additional Resources

- Render Documentation: https://render.com/docs
- Django on Render: https://render.com/docs/deploy-django
- PostgreSQL on Render: https://render.com/docs/databases

---

**🎉 Congratulations!** Your THRIFTY backend is now deployed on Render!
