# Deploy ReviewHub - Complete Step-by-Step Guide

Follow these steps exactly in order. This should take about 20-30 minutes.

---

## 🎯 PART 1: Initialize Database (5 minutes)

### Step 1.1: Install Railway CLI
Open your terminal and run:
```bash
npm install -g @railway/cli
```

### Step 1.2: Login to Railway
```bash
railway login
```
- This will open your browser
- Click "Authorize" to connect Railway CLI to your account

### Step 1.3: Link to Your Project
```bash
railway link
```
- Select your project from the list
- This connects your local folder to Railway

### Step 1.4: Initialize Database Tables
```bash
railway run node backend/src/scripts/initPostgres.js
```
Expected output: "✅ Tables created successfully"

### Step 1.5: Seed Database with Data
```bash
railway run node backend/src/scripts/seedDataPostgres.js
```
Expected output: 
- "✅ Created 13 users"
- "✅ Created 20 products"
- "✅ Created XX reviews"
- "🎉 Database seeding completed successfully!"

✅ **Database is now ready!**

---

## 🚂 PART 2: Deploy Backend to Railway (10 minutes)

### Step 2.1: Commit Your Code to Git
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "ReviewHub application ready for deployment"
```

### Step 2.2: Push to GitHub
```bash
# Create a new repository on GitHub first, then:
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Step 2.3: Deploy Backend on Railway
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will detect Node.js and start deploying

### Step 2.4: Configure Railway Settings
1. Click on your deployed service
2. Go to "Settings" tab
3. Under "Deploy":
   - **Root Directory**: Leave empty
   - **Build Command**: (auto-detected)
   - **Start Command**: `cd backend && node src/index.js`
4. Click "Save"

### Step 2.5: Set Environment Variables
1. Go to "Variables" tab
2. Add these variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
3. `DATABASE_URL` should already be set (from PostgreSQL service)

### Step 2.6: Generate Public Domain
1. Go to "Settings" tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. Copy your URL (e.g., `https://reviewhub-production.up.railway.app`)

✅ **Backend is now deployed!**

Test it: Visit `https://your-backend-url.up.railway.app/health`
Should return: `{"status":"OK",...}`

---

## 🌐 PART 3: Deploy Frontend to Netlify (10 minutes)

### Step 3.1: Update Frontend API URL
1. Open `frontend/src/services/api.js`
2. Find this line:
   ```javascript
   baseURL: 'http://localhost:3000/api',
   ```
3. Change it to your Railway URL:
   ```javascript
   baseURL: 'https://your-backend-url.up.railway.app/api',
   ```
4. Save the file

### Step 3.2: Commit and Push Changes
```bash
git add frontend/src/services/api.js
git commit -m "Update API URL for production"
git push origin main
```

### Step 3.3: Deploy to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Click "Deploy with GitHub"
4. Authorize Netlify to access your GitHub
5. Select your repository

### Step 3.4: Configure Build Settings
On the configuration page, enter:
- **Branch to deploy**: `main`
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

Click "Deploy site"

### Step 3.5: Wait for Deployment
- Netlify will install dependencies and build your app
- This takes 2-3 minutes
- You'll see "Site is live" when done

### Step 3.6: Get Your Live URL
- Netlify provides a URL like: `https://random-name-123.netlify.app`
- Click on it to visit your live site!

✅ **Frontend is now deployed!**

---

## 🎉 PART 4: Test Your Live Application (5 minutes)

### Step 4.1: Visit Your Netlify URL
Open your Netlify URL in a browser

### Step 4.2: Test Features
1. **Browse Products** - Should see 20 products
2. **Click on a product** - Should see reviews
3. **Login as Moderator**:
   - Click user icon in top right
   - Select "Login as Moderator"
4. **Check Moderation Queue**:
   - Click "Moderation Queue" in navigation
   - Should see 10 flagged reviews and 23 pending reviews
5. **View Statistics**:
   - Click "Statistics" in navigation
   - Should see moderation stats

### Step 4.3: Verify Everything Works
- ✅ Products load
- ✅ Reviews display
- ✅ Moderation queue shows data
- ✅ Statistics display correctly

---

## 🎊 SUCCESS!

Your ReviewHub application is now live in production!

**Your URLs:**
- Frontend: `https://your-site.netlify.app`
- Backend: `https://your-backend.up.railway.app`
- Database: PostgreSQL on Railway

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not responding
```bash
# Check Railway logs
railway logs

# Common fixes:
# 1. Verify DATABASE_URL is set in Railway variables
# 2. Check if PostgreSQL service is running
# 3. Redeploy: railway up
```

**Problem**: Database connection errors
```bash
# Re-run initialization
railway run node backend/src/scripts/initPostgres.js
railway run node backend/src/scripts/seedDataPostgres.js
```

### Frontend Issues

**Problem**: API calls failing
1. Open browser console (F12)
2. Check for CORS errors
3. Verify API URL in `frontend/src/services/api.js` is correct
4. Make sure it ends with `/api` not just the domain

**Problem**: "Cannot GET /api/products"
- Backend might not be running
- Check Railway deployment status
- Visit backend health endpoint: `https://your-backend.up.railway.app/health`

### Netlify Build Fails

**Problem**: Build fails on Netlify
1. Check build logs in Netlify dashboard
2. Common issue: Wrong base directory
   - Should be: `frontend`
3. Redeploy: Netlify → Deploys → Trigger deploy

---

## 📝 Optional: Custom Domain

### For Netlify (Frontend)
1. Go to Netlify → Domain settings
2. Click "Add custom domain"
3. Follow instructions to configure DNS

### For Railway (Backend)
1. Go to Railway → Settings → Networking
2. Click "Custom Domain"
3. Add your domain and configure DNS

---

## 💰 Cost

- **Railway**: Free $5/month credit (enough for small apps)
- **Netlify**: Free tier (100GB bandwidth)
- **Total**: $0/month for hobby projects

---

## 🔄 Future Updates

To update your deployed app:

```bash
# Make changes to your code
# Commit and push
git add .
git commit -m "Your update message"
git push origin main

# Both Railway and Netlify will auto-deploy!
```

---

## 📞 Need Help?

If you get stuck:
1. Check the troubleshooting section above
2. Review Railway logs: `railway logs`
3. Check Netlify build logs in dashboard
4. Verify all environment variables are set correctly

---

## ✨ You Did It!

Congratulations! Your full-stack application is now live on the internet! 🚀
