import express from 'express';
import cors from 'cors';
import reviewRoutes from '../../src/routes/reviews.js';
import productRoutes from '../../src/routes/products.js';
import moderationRoutes from '../../src/routes/moderation.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

// Mock the database module to use test database
export function createTestApp(testDb) {
  // Store original database module
  const originalDbModule = await import('../../src/config/database.js');
  
  // Create mock database module
  const mockDb = {
    default: testDb,
    ...testDb
  };

  // Replace the database module in the module cache
  const moduleUrl = new URL('../../src/config/database.js', import.meta.url).href;
  
  // Create app
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Temporarily replace the database for services
  global.testDb = testDb;

  app.use('/api/reviews', reviewRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/moderation', moderationRoutes);
  app.use(errorHandler);

  return app;
}