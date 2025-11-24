# 🆓 Free Tier Deployment Guide

## Perfect for Render Free Tier!

This setup works completely with Render's free tier - no Shell access needed!

---

## ✨ Auto-Initialization

The app automatically:
- ✅ Creates database tables on startup
- ✅ Seeds sample data (users, products, reviews)
- ✅ Skips seeding if data already exists
- ✅ No manual commands required!

---

## 🚀 Deploy Steps

### Step 1: Push Code

```bash
git add .
git commit -m "Fix: Auto-initialize database for free tier"
git push origin main
```

### Step 2: Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Settings:
   - Name: `review-system-db`
   - Plan: **Free**
4. Click "Create Database"
5. **Copy Internal Database URL**

### Step 3: Create Web Service

1. Click "New +" → "Web Service"
2. Connect GitHub: `nehaaggarwal241992/KIRO`
3. Settings:
   - Name: `review-system-api`
   - Root Directory: `backend`
   - Build: `npm install --no-optional`
   - Start: `node src/index.js`
   - Plan: **Free**

4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-internal-database-url>
   JWT_SECRET=my-secret-key-123
   CORS_ORIGIN=*
   ```

5. Click "Create Web Service"

### Step 4: Wait for Magic! ✨

Watch the logs (5-10 minutes):

```
🚀 Loading PostgreSQL database configuration (Production)...
PostgreSQL client connected
Initializing PostgreSQL database...
✅ PostgreSQL database initialized successfully
Seeding initial data...
✅ Initial data seeded successfully
Server running on port 10000
Database status: ✓ HEALTHY
```

### Step 5: Test!

Visit: `https://your-backend.onrender.com/api/products`

You should see 5 products! 🎉

---

## 🎨 Deploy Frontend (Netlify)

### Step 1: Update API URL

1. Open `frontend/src/services/api.js`
2. Update line 3:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com/api';
   ```
3. Save, commit, push

### Step 2: Deploy to Netlify

1. Go to https://app.netlify.com
2. "Add new site" → "Import an existing project"
3. Connect GitHub: `nehaaggarwal241992/KIRO`
4. Settings:
   - Base: `frontend`
   - Build: `npm run build`
   - Publish: `frontend/dist`
   - Env: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Click "Deploy"

### Step 3: Update CORS

1. Render → Your service → Environment
2. Edit `CORS_ORIGIN` to your Netlify URL
3. Save (auto-redeploys)

---

## 📊 What You Get (Free!)

### Sample Data Included:
- ✅ 3 users (2 regular + 1 moderator)
- ✅ 5 products (Electronics, Furniture, Stationery)
- ✅ 5 reviews (mix of approved/pending)

### Features:
- ✅ View products and reviews
- ✅ Create new reviews
- ✅ Moderation system
- ✅ User authentication

---

## ⚠️ Free Tier Limitations

### Render:
- Spins down after 15 min of inactivity
- First request takes ~30 seconds to wake up
- 750 hours/month runtime
- Database expires after 90 days

### Netlify:
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**Perfect for demos and portfolios!**

---

## 🔄 Redeploying

If you need to redeploy:

1. **Clear cache** (Settings → Clear build cache)
2. **Manual deploy** (Clear cache & deploy)
3. **Wait** - database will auto-initialize again
4. **Data persists** - seeding skips if data exists

---

## 🆘 Troubleshooting

### Backend won't start:
- Check logs for errors
- Verify `DATABASE_URL` is set
- Ensure build command is `npm install --no-optional`

### No data showing:
- Check logs for "Initial data seeded successfully"
- Visit `/api/products` directly
- Check database status in logs

### Still getting SQLite errors:
- Clear build cache
- Verify code is pushed to GitHub
- Try deleting and recreating the service

---

## ✅ Success Indicators

Logs should show:
```
✅ PostgreSQL database initialized successfully
✅ Initial data seeded successfully
✅ Server running on port 10000
✅ Database status: ✓ HEALTHY
```

API should return:
```json
[
  {
    "id": 1,
    "name": "Laptop Pro",
    "description": "High-performance laptop...",
    ...
  },
  ...
]
```

---

## 🎉 You're Live!

Your app is now deployed with:
- ✅ Backend on Render (auto-initialized)
- ✅ Frontend on Netlify
- ✅ PostgreSQL database
- ✅ Sample data ready to use

**No Shell access needed!** Everything happens automatically! 🚀
