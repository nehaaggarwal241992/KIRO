# ✅ Deployment Checklist

## Before You Start
- [ ] Code is pushed to GitHub
- [ ] You have a Render.com account
- [ ] You have a Netlify.com account

---

## Render Setup (Backend + Database)

### Database
- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL
- [ ] Database status shows "Available"

### Backend API
- [ ] Create Web Service on Render
- [ ] Connect GitHub repo
- [ ] Set root directory to `backend`
- [ ] Set build command: `npm install`
- [ ] Set start command: `node src/index.js`
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `DATABASE_URL=<your-db-url>`
  - [ ] `JWT_SECRET=<random-secret>`
  - [ ] `CORS_ORIGIN=*`
- [ ] Wait for deployment to complete
- [ ] Copy backend URL

### Initialize Database
- [ ] Open Shell in Render backend service
- [ ] Run: `node src/scripts/initPostgres.js`
- [ ] Run: `node src/scripts/seedDataPostgres.js` (optional)
- [ ] Test: Visit `https://your-backend.onrender.com/api/products`

---

## Netlify Setup (Frontend)

### Deploy
- [ ] Create new site on Netlify
- [ ] Connect GitHub repo
- [ ] Set base directory: `frontend`
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `frontend/dist`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL=https://your-backend.onrender.com/api`
- [ ] Deploy site
- [ ] Copy Netlify URL

### Update CORS
- [ ] Go back to Render backend
- [ ] Update `CORS_ORIGIN` to your Netlify URL
- [ ] Save and wait for redeploy

---

## Testing

- [ ] Frontend loads at Netlify URL
- [ ] Products display correctly
- [ ] Can create a review
- [ ] Can view reviews
- [ ] Moderation features work (if logged in as moderator)

---

## Final Steps

- [ ] Update README with live URLs
- [ ] Share your app! 🎉

---

## Your URLs

**Frontend**: ___________________________

**Backend**: ___________________________

**Database**: (Internal only - managed by Render)
