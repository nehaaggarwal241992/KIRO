# Deployment Guide - ReviewHub

This guide explains how to deploy the ReviewHub application to Netlify.

## Important Note About SQLite

⚠️ **SQLite Limitation**: This application uses SQLite as its database, which is **file-based** and **not suitable for production deployment** on platforms like Netlify. SQLite databases are stored locally and will be reset on each deployment.

For a production deployment, you should:
1. Migrate to a cloud database (PostgreSQL, MySQL, MongoDB, etc.)
2. Use a database hosting service (Supabase, PlanetScale, Railway, etc.)

## Current Setup (Demo/Development Only)

The current setup is designed for **local development and demonstration** purposes only.

### Option 1: Deploy Frontend Only (Static Demo)

If you want to deploy just the frontend as a static demo:

1. **Update API Configuration**
   - The frontend currently points to `http://localhost:3000/api`
   - You'll need to either:
     - Deploy the backend separately (see Option 2)
     - Use mock data in the frontend

2. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Build the frontend
   cd frontend
   npm run build
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

### Option 2: Full Stack Deployment (Requires Database Migration)

For a full production deployment:

1. **Choose a Database Provider**
   - Supabase (PostgreSQL) - Free tier available
   - PlanetScale (MySQL) - Free tier available
   - Railway (PostgreSQL) - Free tier available
   - MongoDB Atlas - Free tier available

2. **Migrate Database Code**
   - Replace SQLite with your chosen database
   - Update connection strings
   - Modify repository layer to use new database client

3. **Deploy Backend**
   - Deploy to a Node.js hosting service:
     - Railway
     - Render
     - Heroku
     - Fly.io
   
4. **Update Frontend API URL**
   - Update `frontend/src/services/api.js`
   - Change `baseURL` to your deployed backend URL

5. **Deploy Frontend to Netlify**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

## Quick Local Demo

To run the application locally:

```bash
# Terminal 1 - Backend
cd backend
npm install
node src/scripts/initAndSeed.js  # Initialize and seed database
node src/index.js                # Start backend server

# Terminal 2 - Frontend (if needed for development)
cd frontend
npm install
npm run dev
```

Or use the combined production build:

```bash
cd backend
npm install
node src/scripts/initAndSeed.js
node src/index.js
# Visit http://localhost:3000
```

## Recommended Production Architecture

```
┌─────────────────┐
│   Netlify       │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Railway/      │
│   Render        │
│   (Backend API) │
└────────┬────────┘
         │
         │
┌────────▼────────┐
│   Supabase/     │
│   PlanetScale   │
│   (Database)    │
└─────────────────┘
```

## Environment Variables

For production deployment, set these environment variables:

### Backend
```
DATABASE_URL=your_database_connection_string
PORT=3000
NODE_ENV=production
```

### Frontend
```
VITE_API_URL=https://your-backend-url.com/api
```

## Next Steps

1. Choose your deployment strategy (demo vs production)
2. If production: Select and set up a cloud database
3. Deploy backend to a Node.js hosting service
4. Update frontend API configuration
5. Deploy frontend to Netlify

## Support

For questions or issues with deployment, please refer to:
- [Netlify Documentation](https://docs.netlify.com/)
- [Railway Documentation](https://docs.railway.app/)
- [Supabase Documentation](https://supabase.com/docs)
