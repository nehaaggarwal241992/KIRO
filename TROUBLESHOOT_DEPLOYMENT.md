# 🔍 Troubleshooting Deployment Issues

## Quick Checks

### 1. Test Backend Directly

Visit in your browser: `https://review-system-api-zwc8.onrender.com/api/products`

**Expected**: JSON with products
**If you see JSON**: Backend works! Issue is CORS or frontend config
**If you see error**: Backend has issues

### 2. Check Browser Console

1. Open your Netlify site: `https://gregarious-cucurucho-6930c5.netlify.app`
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Look for errors

**Common errors:**
- `CORS policy`: CORS issue (see fix below)
- `Network Error`: Backend might be down or wrong URL
- `Failed to fetch`: Connection issue

### 3. Check Network Tab

1. In browser dev tools, go to **Network** tab
2. Refresh the page
3. Look for the request to `/api/products`
4. Click on it to see details

**Check:**
- Status code (should be 200)
- Response (should have JSON data)
- Headers (check CORS headers)

---

## Common Issues & Fixes

### Issue 1: CORS Error

**Error in console**: `Access to fetch at 'https://review-system-api-zwc8.onrender.com/api/products' from origin 'https://gregarious-cucurucho-6930c5.netlify.app' has been blocked by CORS policy`

**Fix**: The backend CORS configuration needs your Netlify URL.

**Check Render logs**:
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. Look for CORS-related errors

**The code should already include your Netlify URL**, but verify in Render logs that it's loading correctly.

### Issue 2: Backend is Down/Sleeping

**Error**: `Network Error` or very slow first load

**Cause**: Render free tier spins down after 15 min

**Fix**: Just wait ~30 seconds for it to wake up, then refresh

### Issue 3: Wrong API URL

**Check Netlify environment variables**:
1. Go to Netlify dashboard
2. Click your site
3. Go to "Site configuration" → "Environment variables"
4. Verify `VITE_API_URL` = `https://review-system-api-zwc8.onrender.com/api`

**If missing or wrong**:
1. Update it
2. Go to "Deploys" → "Trigger deploy" → "Clear cache and deploy"

### Issue 4: Frontend Not Updated

**Check if frontend has latest code**:
1. View page source (right-click → View Page Source)
2. Look for the API URL in the JavaScript
3. Should reference `review-system-api-zwc8.onrender.com`

**If it still shows localhost**:
1. Netlify might not have rebuilt
2. Go to Netlify → Deploys → Trigger deploy

---

## Step-by-Step Debug

### Step 1: Verify Backend Works

```bash
# Test in terminal or browser
curl https://review-system-api-zwc8.onrender.com/api/products
```

**Expected output**: JSON array with 5 products

**If this fails**: Backend issue (check Render logs)
**If this works**: Continue to Step 2

### Step 2: Check CORS Headers

```bash
curl -I -X OPTIONS https://review-system-api-zwc8.onrender.com/api/products \
  -H "Origin: https://gregarious-cucurucho-6930c5.netlify.app"
```

**Look for**:
- `Access-Control-Allow-Origin: https://gregarious-cucurucho-6930c5.netlify.app`

**If missing**: CORS not configured correctly

### Step 3: Check Frontend Config

1. Open browser console on Netlify site
2. Type: `localStorage.clear()` and press Enter
3. Refresh the page
4. Check if it works now

### Step 4: Check Render Logs

1. Go to Render dashboard
2. Click your service
3. Click "Logs"
4. Look for:
   - ✅ "Server running on port 10000"
   - ✅ "Database status: ✓ HEALTHY"
   - ❌ Any error messages

---

## Nuclear Option: Redeploy Everything

If nothing works, try a fresh deployment:

### 1. Clear Netlify Cache

1. Netlify → Site → Deploys
2. "Trigger deploy" → "Clear cache and deploy"

### 2. Restart Render Service

1. Render → Service → Manual Deploy
2. "Clear build cache & deploy"

### 3. Wait 10 Minutes

Both services need time to rebuild and start.

---

## Still Not Working?

### Check These:

1. **Backend URL in frontend code**:
   - Should be: `https://review-system-api-zwc8.onrender.com/api`
   - Check `frontend/src/services/api.js`

2. **CORS in backend code**:
   - Should include: `https://gregarious-cucurucho-6930c5.netlify.app`
   - Check `backend/src/index.js`

3. **Environment variables**:
   - Netlify: `VITE_API_URL`
   - Render: `DATABASE_URL`, `NODE_ENV`, `PORT`

---

## Get Detailed Error Info

Add this to your browser console to see detailed errors:

```javascript
// In browser console on Netlify site
fetch('https://review-system-api-zwc8.onrender.com/api/products')
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e));
```

This will show you exactly what's failing.

---

## Contact Info

If you're still stuck, check:
1. Render logs for backend errors
2. Browser console for frontend errors
3. Network tab for request/response details

The issue is likely one of:
- CORS configuration
- Backend sleeping (wait 30 sec)
- Wrong API URL in frontend
- Environment variables not set
