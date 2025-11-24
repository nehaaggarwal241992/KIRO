# 🔄 Clear Render Cache & Redeploy

## The Issue

Render might be using cached/old code that still has SQLite imports. We need to force a clean rebuild.

---

## Solution: Clear Build Cache

### Step 1: Push Latest Code

```bash
git add .
git commit -m "Fix: Remove all SQLite imports and add renderignore"
git push origin main
```

### Step 2: Clear Render Cache

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your service** (`review-system-api`)
3. **Click "Settings"** (left sidebar)
4. **Scroll down** to find "Build & Deploy" section
5. **Click "Clear build cache"** button
6. **Confirm** the action

### Step 3: Manual Deploy

1. **Go to "Manual Deploy"** section (in Settings or top right)
2. **Click "Clear build cache & deploy"**
3. **Wait 5-10 minutes** for fresh build

---

## Alternative: Delete & Recreate Service

If clearing cache doesn't work, delete and recreate:

### Delete Old Service

1. Go to your service → Settings
2. Scroll to bottom → "Danger Zone"
3. Click "Delete Web Service"
4. Confirm deletion

### Create New Service

1. Click "New +" → "Web Service"
2. Connect GitHub: `nehaaggarwal241992/KIRO`
3. Configure:
   - **Name**: `review-system-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install --no-optional`
   - **Start Command**: `node src/index.js`
   - **Plan**: Free

4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-database-url>
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=*
   ```

5. Click "Create Web Service"

---

## Verify It Works

Watch the deployment logs. You should see:

```
✅ npm install --no-optional
✅ Skipping optional dependencies
✅ 🚀 Loading PostgreSQL database configuration (Production)...
✅ Initializing PostgreSQL database...
✅ ✅ PostgreSQL database initialized successfully
✅ Server running on port 10000
```

**NO** errors about:
- ❌ "invalid ELF header"
- ❌ "Cannot find package 'better-sqlite3'"

---

## Test

Visit: `https://your-backend.onrender.com/api/products`

Should return JSON! 🎉

---

## Why This Works

1. **Clear cache** removes old node_modules
2. **`npm install --no-optional`** skips SQLite completely
3. **`.renderignore`** excludes test files
4. **Fresh build** uses only the new code

---

## Still Having Issues?

The error message might be misleading. Double-check:

1. **Is the code pushed?**
   ```bash
   git log -1  # Should show your latest commit
   ```

2. **Is the build command correct?**
   - Render → Settings → Build Command
   - Should be: `npm install --no-optional`

3. **Is DATABASE_URL set?**
   - Render → Environment
   - Should have `DATABASE_URL=postgresql://...`

4. **Try the "Delete & Recreate" option above**

---

## Success Indicators

When it works, logs will show:
```
🚀 Loading PostgreSQL database configuration (Production)...
PostgreSQL client connected
✅ PostgreSQL database initialized successfully
Server running on port 10000
Health check: http://localhost:10000/health
Database status: ✓ HEALTHY
```

No SQLite errors at all!
