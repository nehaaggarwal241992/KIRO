# Railway Setup - Quick Steps

## Your Current Database URL
```
postgresql://postgres:OIPEmStLabvyEXkSYZjEuOeGMRcewKEF@postgres.railway.internal:5432/railway
```

⚠️ This is an **internal** URL that only works within Railway's network.

## Get the Public Database URL

### Option 1: Railway Dashboard
1. Go to your Railway project
2. Click on the **PostgreSQL** service
3. Go to the **Connect** tab
4. Look for **Public Networking** section
5. Copy the **External URL** (it will look like):
   ```
   postgresql://postgres:OIPEmStLabvyEXkSYZjEuOeGMRcewKEF@containers-us-west-xxx.railway.app:7432/railway
   ```

### Option 2: Railway CLI (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Get all variables (including public DATABASE_URL)
railway variables

# Or run commands directly on Railway
railway run node backend/src/scripts/initPostgres.js
railway run node backend/src/scripts/seedDataPostgres.js
```

## Initialize & Seed Database

### Using Railway CLI (Easiest)
```bash
# From project root
railway run node backend/src/scripts/initPostgres.js
railway run node backend/src/scripts/seedDataPostgres.js
```

### Using Public URL Locally
```bash
# Set the public DATABASE_URL
export DATABASE_URL="postgresql://postgres:OIPEmStLabvyEXkSYZjEuOeGMRcewKEF@containers-us-west-xxx.railway.app:7432/railway"

# Initialize tables
node backend/src/scripts/initPostgres.js

# Seed data
node backend/src/scripts/seedDataPostgres.js
```

## Next Steps After Database is Ready

1. **Deploy Backend to Railway**
   - Push code to GitHub
   - Connect Railway to your GitHub repo
   - Railway will auto-deploy

2. **Get Your Backend URL**
   - Railway will provide a public URL
   - Example: `https://reviewhub-production.up.railway.app`

3. **Update Frontend API URL**
   - Edit `frontend/src/services/api.js`
   - Change baseURL to your Railway backend URL

4. **Deploy Frontend to Netlify**
   - Push updated code to GitHub
   - Connect Netlify to your repo
   - Configure build settings
   - Deploy!

## Troubleshooting

### Can't Connect to Database
- Make sure you're using the **public** URL (with `containers-us-west` hostname)
- Check if Railway PostgreSQL service is running
- Verify the password in the connection string

### Railway CLI Issues
```bash
# Reinstall CLI
npm uninstall -g @railway/cli
npm install -g @railway/cli

# Re-login
railway logout
railway login
```

### Database Already Initialized
If tables already exist, you can just run the seed script:
```bash
railway run node backend/src/scripts/seedDataPostgres.js
```

## Quick Test

After seeding, test your database:
```bash
railway run psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"
railway run psql $DATABASE_URL -c "SELECT COUNT(*) FROM reviews WHERE status='flagged';"
```

Should show:
- 20 products
- 10 flagged reviews
