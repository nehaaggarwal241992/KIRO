# Deployment Checklist - ReviewHub

Follow these steps in order to deploy your application to production.

## ✅ Pre-Deployment Checklist

- [ ] Git repository created and code committed
- [ ] Railway account created
- [ ] Netlify account created
- [ ] GitHub repository is public or connected to Railway/Netlify

## 📦 Step 1: Install PostgreSQL Driver

```bash
cd backend
npm install pg dotenv
```

## 🚂 Step 2: Set Up Railway

### 2.1 Create Railway Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Note: Railway creates a PostgreSQL database automatically

### 2.2 Get Database URL
1. Click on the PostgreSQL service
2. Go to "Variables" tab
3. Copy the `DATABASE_URL` value
4. It looks like: `postgresql://postgres:password@host:5432/railway`

### 2.3 Initialize Database
Run locally with Railway database:
```bash
# Set environment variable
export DATABASE_URL="your_railway_postgres_url"

# Run init script
node backend/src/scripts/initPostgres.js
```

## 🔧 Step 3: Deploy Backend to Railway

### 3.1 Connect GitHub Repository
1. In Railway, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will auto-detect Node.js

### 3.2 Configure Build Settings
Railway should auto-detect, but verify:
- **Root Directory**: Leave empty (we have railway.json)
- **Build Command**: Handled by railway.json
- **Start Command**: Handled by railway.json

### 3.3 Set Environment Variables
In Railway project → Variables tab, add:
```
NODE_ENV=production
PORT=3000
```
(DATABASE_URL is already set from PostgreSQL service)

### 3.4 Deploy
- Railway will automatically deploy
- Wait for deployment to complete
- Click "Generate Domain" to get your backend URL
- Example: `https://your-app.up.railway.app`

### 3.5 Seed Database
After first deployment, seed the database:

Option A: Railway CLI
```bash
npm install -g @railway/cli
railway login
railway link
railway run node backend/src/scripts/seedDataPostgres.js
```

Option B: Add seed script to package.json and run once

## 🌐 Step 4: Deploy Frontend to Netlify

### 4.1 Update API URL
Edit `frontend/src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: 'https://your-app.up.railway.app/api', // Your Railway URL here!
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 4.2 Commit Changes
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

### 4.3 Deploy to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select your repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: 18
6. Click "Deploy site"

### 4.4 Wait for Deployment
- Netlify will build and deploy
- You'll get a URL like: `https://your-app.netlify.app`

## ✨ Step 5: Test Your Deployment

### 5.1 Test Backend
Visit: `https://your-app.up.railway.app/health`
Should return: `{"status":"OK",...}`

### 5.2 Test Frontend
1. Visit your Netlify URL
2. Browse products
3. Click "Login as Moderator"
4. Check moderation queue
5. Verify all features work

## 🐛 Troubleshooting

### Backend Not Working
```bash
# Check Railway logs
railway logs

# Common issues:
- DATABASE_URL not set correctly
- PostgreSQL service not running
- Build failed - check logs
```

### Frontend API Errors
- Check browser console (F12)
- Verify API URL in `frontend/src/services/api.js`
- Check CORS settings in backend
- Verify backend is running on Railway

### Database Issues
```bash
# Re-run initialization
railway run node backend/src/scripts/initPostgres.js

# Check if tables exist
railway run psql $DATABASE_URL -c "\dt"
```

## 📊 Post-Deployment

- [ ] Test all features
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring
- [ ] Set up database backups
- [ ] Add error tracking (Sentry, etc.)

## 💰 Cost Summary

- **Railway**: $5/month credit (free tier)
- **Netlify**: Free tier (100GB bandwidth)
- **Total**: $0/month for small projects

## 🎉 Success!

Your ReviewHub application is now live in production!

- Frontend: https://your-app.netlify.app
- Backend: https://your-app.up.railway.app
- Database: PostgreSQL on Railway

## 📝 Notes

- Keep your DATABASE_URL secret
- Don't commit .env files
- Monitor Railway usage to stay within free tier
- Set up GitHub Actions for CI/CD (optional)
