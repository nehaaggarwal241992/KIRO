# Production Deployment Guide - ReviewHub

This guide will walk you through deploying ReviewHub to production using:
- **Railway** - Backend API and PostgreSQL database (Free tier)
- **Netlify** - Frontend hosting (Free tier)

## Step 1: Set Up Railway Account & Database

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Verify your email

### 1.2 Create New Project
1. Click "New Project"
2. Select "Provision PostgreSQL"
3. Railway will create a PostgreSQL database
4. Click on the PostgreSQL service
5. Go to "Variables" tab
6. Copy the `DATABASE_URL` - you'll need this!

Example: `postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway`

## Step 2: Prepare Backend for PostgreSQL

### 2.1 Install PostgreSQL Driver
```bash
cd backend
npm install pg
```

### 2.2 Update package.json
The `pg` package is now added to dependencies.

### 2.3 Environment Variables
Create `backend/.env` file:
```
DATABASE_URL=your_railway_postgres_url_here
PORT=3000
NODE_ENV=production
```

## Step 3: Deploy Backend to Railway

### 3.1 Push to GitHub
```bash
# From project root
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 3.2 Deploy on Railway
1. Go to Railway dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will detect it's a Node.js app
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Start Command**: `node src/index.js`

### 3.3 Add Environment Variables
In Railway project settings → Variables:
- `NODE_ENV` = `production`
- `PORT` = `3000`
- `DATABASE_URL` = (already set from PostgreSQL service)

### 3.4 Get Your Backend URL
- Railway will provide a URL like: `https://your-app.railway.app`
- Copy this URL - you'll need it for the frontend!

## Step 4: Initialize Database

### 4.1 Run Migration Script
Once deployed, you need to initialize the database with tables and seed data.

Option A: Use Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run init script
railway run node src/scripts/initAndSeed.js
```

Option B: Add to start script (automatic on deploy)
Update `backend/src/index.js` to run init on first start.

## Step 5: Deploy Frontend to Netlify

### 5.1 Update API URL
Edit `frontend/src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: 'https://your-app.railway.app/api', // Your Railway URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 5.2 Build Frontend
```bash
cd frontend
npm run build
```

### 5.3 Deploy to Netlify

Option A: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

Option B: Netlify Dashboard
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select your repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Click "Deploy site"

### 5.4 Add Environment Variable (Optional)
In Netlify → Site settings → Environment variables:
- `VITE_API_URL` = `https://your-app.railway.app/api`

## Step 6: Test Your Deployment

1. Visit your Netlify URL
2. Test product browsing
3. Login as moderator
4. Check moderation queue
5. Verify all features work

## Troubleshooting

### Backend Issues
- Check Railway logs: Railway dashboard → Deployments → View logs
- Verify DATABASE_URL is set correctly
- Ensure PostgreSQL service is running

### Frontend Issues
- Check browser console for errors
- Verify API URL is correct
- Check CORS settings in backend

### Database Issues
- Verify tables were created
- Check Railway PostgreSQL logs
- Re-run init script if needed

## Cost Estimate

- **Railway**: Free tier includes $5/month credit (enough for small apps)
- **Netlify**: Free tier includes 100GB bandwidth/month
- **Total**: $0/month for hobby projects

## Next Steps

1. Set up custom domain (optional)
2. Enable HTTPS (automatic on both platforms)
3. Set up monitoring and alerts
4. Configure backup strategy for database

## Support

- Railway: https://docs.railway.app
- Netlify: https://docs.netlify.com
- PostgreSQL: https://www.postgresql.org/docs/
