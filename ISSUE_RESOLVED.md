# 🐛 Issue Resolved: Network Error

## ❌ **The Problem**

**Error Message:** "Network error - please check your connection"

**What Happened:**
The frontend React app was trying to connect to the API at `http://localhost:3001/api`, but the debug server was running on `http://localhost:3000`.

## 🔍 **How We Debugged It**

### Step 1: Identified the Error
- Frontend showed: "Oops! Something went wrong - Network error"
- This indicated the frontend couldn't reach the backend

### Step 2: Checked Backend Status
- Verified the debug server was running on port 3000
- Confirmed API endpoints were working (tested with PowerShell)

### Step 3: Found the Mismatch
- Checked `frontend/src/services/api.js`
- Found: `baseURL: 'http://localhost:3001/api'`
- But server was on: `http://localhost:3000`

### Step 4: Fixed the Configuration
- Changed API base URL from port 3001 to 3000
- Rebuilt the frontend with `npm run build`
- Verified the fix worked

## ✅ **The Solution**

**File:** `frontend/src/services/api.js`

**Changed:**
```javascript
// Before (WRONG)
baseURL: 'http://localhost:3001/api',

// After (CORRECT)
baseURL: 'http://localhost:3000/api',
```

## 🎯 **Why This Happened**

During development, we had multiple servers running:
- **Simple demo server** on port 3001
- **Debug/Production server** on port 3000

The frontend was configured for the demo server (3001), but we're now using the debug server (3000).

## 🚀 **How to Prevent This**

### Option 1: Use Environment Variables

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

Then in `api.js`:
```javascript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
```

### Option 2: Use Consistent Ports

Always run your backend on the same port (e.g., 3000) for all environments.

### Option 3: Use Proxy in Development

In `frontend/vite.config.js`:
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

## 📊 **Verification**

After the fix:
1. ✅ API responds with 200 OK
2. ✅ Products endpoint returns data
3. ✅ Frontend can now fetch products
4. ✅ Debug logs show successful requests

## 💡 **Debugging Tips for Similar Issues**

### When you see "Network error":

1. **Check if backend is running**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3000/health"
   ```

2. **Check the API URL in frontend**
   - Look in `frontend/src/services/api.js`
   - Verify the `baseURL` matches your server

3. **Check browser DevTools**
   - Open Network tab (F12)
   - Look for failed requests (red)
   - Check the URL being called

4. **Check CORS**
   - If you see CORS errors, the backend needs CORS enabled
   - Our debug server has CORS enabled with `app.use(cors())`

5. **Check server logs**
   - If requests aren't showing in logs, they're not reaching the server
   - This usually means wrong URL or server not running

## 🎓 **What We Learned**

1. **Always check the API URL** when you get network errors
2. **Use debug logging** to see what's happening
3. **Test API endpoints directly** before debugging the frontend
4. **Keep port numbers consistent** across environments
5. **Use environment variables** for configuration

## 🎉 **Status: RESOLVED**

The application is now working correctly:
- ✅ Backend running on http://localhost:3000
- ✅ Frontend configured to connect to http://localhost:3000/api
- ✅ Products loading successfully
- ✅ All API endpoints functional

**You can now access the app at:** http://localhost:3000

---

## 📝 **Quick Reference**

**Backend Server:** http://localhost:3000
**API Base URL:** http://localhost:3000/api
**Frontend Build:** `cd frontend && npm run build`
**Start Debug Server:** `cd backend && npm run debug`

**Test Endpoints:**
- Health: http://localhost:3000/health
- Products: http://localhost:3000/api/products
- Reviews: http://localhost:3000/api/products/1/reviews
- Rating: http://localhost:3000/api/products/1/rating