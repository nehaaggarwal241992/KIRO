# 🔧 Fix: "invalid ELF header" Error on Render

## Problem
You're getting this error when deploying to Render:
```
Error: /opt/render/project/src/backend/node_modules/better-sqlite3/build/Release/better_sqlite3.node: invalid ELF header
```

## Why This Happens
- Your app has **better-sqlite3** (SQLite) installed for local development
- SQLite has native bindings compiled for Windows
- Render runs on Linux, so those bindings don't work
- **We only need PostgreSQL in production**, not SQLite!

## ✅ Solution

### Option 1: Update Build Command (Quick Fix)

1. **Go to your Render service** (review-system-api)
2. **Click "Settings"**
3. **Find "Build Command"**
4. **Change from**: `npm install`
5. **Change to**: `npm install --omit=optional`
6. **Click "Save Changes"**
7. **Render will auto-redeploy** (wait 5 minutes)

This tells npm to skip optional dependencies (SQLite) during installation.

### Option 2: Update package.json (Better Long-term)

I've already updated your `package.json` to move SQLite to `optionalDependencies`. 

**Next steps**:
1. **Commit and push** the updated `package.json` to GitHub
2. **Render will auto-redeploy** with the fix
3. Or manually trigger redeploy in Render dashboard

## ✅ Verify Fix

After redeployment:
1. **Check Render logs** - should see "Build successful"
2. **Visit**: `https://your-backend.onrender.com/api/products`
3. **Should return JSON** (not an error)

## 🎯 What Changed

**Before** (package.json):
```json
"dependencies": {
  "better-sqlite3": "^12.4.1",
  "sqlite3": "^5.1.6",
  "pg": "^8.16.3",
  ...
}
```

**After** (package.json):
```json
"dependencies": {
  "pg": "^8.16.3",
  ...
},
"optionalDependencies": {
  "better-sqlite3": "^12.4.1",
  "sqlite3": "^5.1.6"
}
```

This way:
- ✅ SQLite works locally for development
- ✅ PostgreSQL works in production on Render
- ✅ No conflicts between the two

## 🚀 You're All Set!

Once this is fixed, continue with the deployment guide from Step 3 (Initialize Database).
