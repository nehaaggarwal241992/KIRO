import express from 'express';
import cors from 'cors';
import './config/initDatabase.js'; // Initialize database on startup
import db from './config/databaseLoader.js'; // Import smart database loader (PostgreSQL or SQLite)
import reviewsRouter from './routes/reviews.js';
import productsRouter from './routes/products.js';
import moderationRouter from './routes/moderation.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow frontend requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite dev server and potential frontend ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

// Parse JSON bodies
app.use(express.json());

// Enhanced health check endpoint with database status
app.get('/health', (req, res) => {
  try {
    const dbHealthy = db.healthCheck();
    const dbInfo = db.getInfo();
    
    res.json({ 
      status: dbHealthy ? 'OK' : 'DEGRADED',
      message: 'Feedback Review System API is running',
      database: {
        healthy: dbHealthy,
        configuration: dbInfo
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database-specific health endpoint
app.get('/health/database', (req, res) => {
  try {
    const dbHealthy = db.healthCheck();
    const dbInfo = db.getInfo();
    
    // Get table counts for additional health info
    const tableStats = {};
    const tables = ['users', 'products', 'reviews', 'moderation_actions'];
    
    for (const table of tables) {
      try {
        const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
        tableStats[table] = result.count;
      } catch (error) {
        tableStats[table] = `Error: ${error.message}`;
      }
    }
    
    res.json({
      healthy: dbHealthy,
      configuration: dbInfo,
      tables: tableStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/reviews', reviewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/moderation', moderationRouter);

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found'
    }
  });
});

// Serve static files from the React app
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const frontendDistPath = join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(frontendDistPath, 'index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server with enhanced logging and error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Database health: http://localhost:${PORT}/health/database`);
  
  // Perform initial database health check
  try {
    const dbHealthy = db.healthCheck();
    console.log(`Database status: ${dbHealthy ? '✓ HEALTHY' : '✗ UNHEALTHY'}`);
    
    if (dbHealthy) {
      const dbInfo = db.getInfo();
      console.log('Database configuration:', dbInfo);
    }
  } catch (error) {
    console.error('Initial database health check failed:', error);
  }
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down server gracefully...');
  server.close(() => {
    console.log('Server closed');
    // Database will be closed by the graceful shutdown handler in database.js
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down server gracefully...');
  server.close(() => {
    console.log('Server closed');
    // Database will be closed by the graceful shutdown handler in database.js
  });
});