# 🎨 Deploy Frontend to Netlify

## Backend is Working! ✅

Your backend API is live at: `https://review-system-api-zwc8.onrender.com`

Now let's deploy the frontend!

---

## Step 1: Push Frontend Changes (1 min)

```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

---

## Step 2: Deploy to Netlify (5 min)

### A. Sign Up / Log In

1. Go to https://app.netlify.com
2. Sign up or log in (use GitHub for easy connection)

### B. Create New Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Authorize Netlify to access your GitHub
4. Select repository: **`nehaaggarwal241992/KIRO`**

### C. Configure Build Settings

**Site settings:**
- **Branch to deploy**: `main`
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

**Environment variables** (click "Show advanced"):
- Key: `VITE_API_URL`
- Value: `https://review-system-api-zwc8.onrender.com/api`

### D. Deploy!

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build
3. **Copy your Netlify URL** (e.g., `https://random-name-123.netlify.app`)

---

## Step 3: Update CORS on Backend (2 min)

Now that you have your Netlify URL, update the backend CORS:

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click your service: **`review-system-api`**
3. Click **"Environment"** (left sidebar)
4. Find **`CORS_ORIGIN`**
5. Click **"Edit"**
6. Change from `*` to your Netlify URL: `https://your-site.netlify.app`
7. Click **"Save Changes"**
8. Wait ~2 minutes for auto-redeploy

---

## Step 4: Test Your App! 🎉

Visit your Netlify URL: `https://your-site.netlify.app`

You should see:
- ✅ Products loading
- ✅ Can view reviews
- ✅ Can create new reviews
- ✅ Everything works!

---

## 🎯 Your Live URLs

**Frontend**: https://_____________________.netlify.app

**Backend**: https://review-system-api-zwc8.onrender.com

---

## 🔧 Troubleshooting

### Frontend shows "Network Error"
- Check that `VITE_API_URL` is set correctly in Netlify
- Verify backend is running (visit backend URL)
- Check browser console for CORS errors

### CORS Error in Browser
- Make sure you updated `CORS_ORIGIN` on Render
- Should be your exact Netlify URL (no trailing slash)
- Wait for backend to redeploy after changing

### Build Fails on Netlify
- Check build logs in Netlify dashboard
- Verify `frontend/package.json` exists
- Make sure base directory is set to `frontend`

---

## 🎉 Success!

Your full-stack app is now live:
- ✅ Backend on Render (PostgreSQL database)
- ✅ Frontend on Netlify
- ✅ Auto-deploys on git push
- ✅ Free tier (perfect for demos!)

**Share your Netlify URL and show off your work!** 🚀

---

## 📝 Optional: Custom Domain

Want a custom domain like `myapp.com`?

1. **Netlify**: Settings → Domain management → Add custom domain
2. **Render**: Settings → Custom domain → Add domain
3. Update DNS records as instructed

---

## 🔄 Future Updates

To update your app:

1. Make changes locally
2. Test locally: `npm run dev` (frontend) and `npm start` (backend)
3. Commit and push to GitHub
4. Both Netlify and Render auto-deploy!

---

## ⚠️ Free Tier Reminders

**Render:**
- Spins down after 15 min (first load takes ~30 sec)
- Database expires after 90 days

**Netlify:**
- 100 GB bandwidth/month
- 300 build minutes/month

Perfect for portfolios and demos!
