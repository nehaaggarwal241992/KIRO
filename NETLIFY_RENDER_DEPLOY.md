# 🚀 Deploy to Netlify + Render (Free Tier)

## Overview
- **Frontend**: Netlify (React app)
- **Backend + Database**: Render.com (Node.js + PostgreSQL)

Total cost: **$0** (completely free!)

---

## 📋 Prerequisites

1. ✅ GitHub account with your code pushed
2. ✅ Netlify account (sign up at https://netlify.com)
3. ✅ Render account (sign up at https://render.com)

---

## Part 1: Deploy Backend + Database on Render

### Step 1: Create PostgreSQL Database

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → Select **"PostgreSQL"**
3. **Fill in details**:
   - Name: `review-system-db`
   - Database: `reviewsystem`
   - User: `reviewsystem_user` (auto-generated)
   - Region: Choose closest to you
   - Plan: **Free**
4. **Click "Create Database"**
5. **Wait 2-3 minutes** for database to provision
6. **Copy the "Internal Database URL"** (starts with `postgresql://`)
   - You'll need this for the backend!

### Step 2: Deploy Backend API

1. **Click "New +"** → Select **"Web Service"**
2. **Connect your GitHub repository**: `nehaaggarwal241992/KIRO`
3. **Configure the service**:
   - **Name**: `review-system-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --no-optional`
   - **Start Command**: `node src/index.js`
   - **Plan**: **Free**

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<paste your Internal Database URL from Step 1>
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=*
```

5. **Click "Create Web Service"**
6. **Wait 5-10 minutes** for deployment
7. **Copy your backend URL** (e.g., `https://review-system-api.onrender.com`)

### Step 3: Initialize Database

Once backend is deployed:

1. **Go to your backend service** on Render
2. **Click "Shell"** tab (opens a terminal)
3. **Run initialization**:
```bash
node src/scripts/initPostgres.js
```

4. **Seed with demo data** (optional):
```bash
node src/scripts/seedDataPostgres.js
```

5. **Verify it works**:
   - Visit: `https://your-backend-url.onrender.com/api/products`
   - You should see JSON data!

---

## Part 2: Deploy Frontend on Netlify

### Step 1: Prepare Frontend

First, we need to configure the frontend to use your Render backend URL.

**Update frontend API configuration**:

1. Open `frontend/src/services/api.js`
2. Update the base URL to your Render backend:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://review-system-api.onrender.com/api';
```

3. **Commit and push** this change to GitHub

### Step 2: Deploy to Netlify

1. **Go to Netlify**: https://app.netlify.com
2. **Click "Add new site"** → **"Import an existing project"**
3. **Connect to GitHub**: Select `nehaaggarwal241992/KIRO`
4. **Configure build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

5. **Add Environment Variables**:
   - Click "Show advanced"
   - Add variable:
     - Key: `VITE_API_URL`
     - Value: `https://review-system-api.onrender.com/api` (your Render backend URL)

6. **Click "Deploy site"**
7. **Wait 2-3 minutes** for build to complete
8. **Copy your site URL** (e.g., `https://random-name-123.netlify.app`)

### Step 3: Update CORS on Backend

Now that you have your Netlify URL, update the backend CORS settings:

1. **Go to Render Dashboard** → Your backend service
2. **Click "Environment"** tab
3. **Edit `CORS_ORIGIN`**:
   - Change from `*` to your Netlify URL: `https://your-site.netlify.app`
4. **Save** (backend will auto-redeploy)

---

## Part 3: Test Your Deployment

### Test Backend
Visit: `https://your-backend-url.onrender.com/api/products`
- Should return JSON with products

### Test Frontend
Visit: `https://your-site.netlify.app`
- Should load the React app
- Should display products from backend
- Try creating a review

---

## 🎯 Your Live URLs

After deployment, you'll have:

- **Frontend**: `https://your-site.netlify.app`
- **Backend API**: `https://review-system-api.onrender.com`
- **Database**: Managed by Render (internal access only)

---

## ⚠️ Important Notes

### Render Free Tier Limitations
- **Spins down after 15 min** of inactivity
- **First request takes ~30 seconds** to wake up
- **750 hours/month** of runtime (enough for hobby projects)
- **Database expires after 90 days** (you'll need to create a new one)

### Netlify Free Tier
- **100 GB bandwidth/month**
- **300 build minutes/month**
- **Unlimited sites**

---

## 🔧 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify `DATABASE_URL` is set correctly
- Make sure `Start Command` is `node src/index.js`

### Error: "invalid ELF header" or "better-sqlite3" error
- ✅ **FIXED!** The code now automatically uses PostgreSQL in production
- Make sure you've pushed the latest code to GitHub
- Verify Build Command is: `npm install --omit=optional`
- Check that `DATABASE_URL` environment variable is set
- The app will automatically detect and use PostgreSQL when `DATABASE_URL` is present

### Frontend can't connect to backend
- Check `VITE_API_URL` environment variable
- Verify CORS_ORIGIN on backend matches your Netlify URL
- Check browser console for errors

### Database connection fails
- Verify you're using the **Internal Database URL** (not External)
- Check database is in "Available" status on Render

### First load is slow
- This is normal! Render free tier spins down after 15 min
- Subsequent requests will be fast

---

## 🔄 Updating Your App

### Update Frontend
1. Push changes to GitHub
2. Netlify auto-deploys (or click "Trigger deploy")

### Update Backend
1. Push changes to GitHub
2. Render auto-deploys from `main` branch

---

## 💡 Next Steps

1. **Custom Domain** (optional):
   - Netlify: Settings → Domain management
   - Render: Settings → Custom domain

2. **Environment Variables**:
   - Keep `JWT_SECRET` secure
   - Update `CORS_ORIGIN` to your actual domain

3. **Monitoring**:
   - Check Render logs for backend issues
   - Check Netlify deploy logs for frontend issues

---

## 🎉 You're Done!

Your app is now live and accessible to anyone on the internet!

**Share your frontend URL** with others to show off your work! 🚀
