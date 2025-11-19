import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { createTestDatabase, seedTestData } from '../helpers/testDatabase.js';
import { setTestDatabase, clearTestDatabase } from '../../src/config/testDatabase.js';

// Import routes and middleware
import reviewRoutes from '../../src/routes/reviews.js';
import productRoutes from '../../src/routes/products.js';
import moderationRoutes from '../../src/routes/moderation.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Error Handling Integration Tests', () => {
  let app;
  let db;

  beforeEach(() => {
    // Create test database in memory
    db = createTestDatabase();
    
    // Seed test data
    seedTestData(db);
    
    // Set test database for repositories
    setTestDatabase(db);

    // Set up Express app
    app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/api/reviews', reviewRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/moderation', moderationRoutes);
    app.use(errorHandler);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
    clearTestDatabase();
  });

  describe('400 Bad Request - Validation Errors', () => {
    it('should return 400 for missing required fields in review creation', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          userId: 1,
          productId: 1
          // missing rating and reviewText
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Missing required fields');
      expect(response.body.error).toHaveProperty('field');
    });

    it('should return 400 for invalid rating value', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          userId: 1,
          productId: 1,
          rating: 6, // Invalid rating > 5
          reviewText: 'Test review'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Rating must be');
      expect(response.body.error.field).toBe('rating');
    });

    it('should return 400 for invalid rating value (too low)', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          userId: 1,
          productId: 1,
          rating: 0, // Invalid rating < 1
          reviewText: 'Test review'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Rating must be');
      expect(response.body.error.field).toBe('rating');
    });

    it('should return 400 for non-numeric IDs', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          userId: 'invalid',
          productId: 1,
          rating: 4,
          reviewText: 'Test review'
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be valid numbers');
      expect(response.body.error.field).toBe('body');
    });

    it('should return 400 for invalid review ID in GET request', async () => {
      const response = await request(app)
        .get('/api/reviews/invalid')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be a valid number');
      expect(response.body.error.field).toBe('id');
    });

    it('should return 400 for invalid product ID in product routes', async () => {
      const response = await request(app)
        .get('/api/products/invalid/reviews')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be a valid number');
      expect(response.body.error.field).toBe('id');
    });

    it('should return 400 for invalid date format in moderation history', async () => {
      const response = await request(app)
        .get('/api/moderation/history?startDate=invalid-date')
        .set('x-user-id', '3')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Invalid startDate format');
      expect(response.body.error.field).toBe('startDate');
    });

    it('should return 400 for invalid moderator ID filter', async () => {
      const response = await request(app)
        .get('/api/moderation/history?filterModeratorId=invalid')
        .set('x-user-id', '3')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be a valid number');
      expect(response.body.error.field).toBe('filterModeratorId');
    });

    it('should return 400 for missing required fields in review update', async () => {
      const response = await request(app)
        .put('/api/reviews/1')
        .set('x-user-id', '1')
        .send({}) // Missing rating and reviewText
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Missing required fields');
      expect(response.body.error.field).toBe('body');
    });
  });

  describe('401 Unauthorized - Authentication Errors', () => {
    it('should return 401 for missing authentication in review update', async () => {
      const response = await request(app)
        .put('/api/reviews/1')
        .send({
          rating: 4,
          reviewText: 'Updated review'
        })
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('User authentication required');
      expect(response.body.error.field).toBe('x-user-id');
    });

    it('should return 401 for missing authentication in review deletion', async () => {
      const response = await request(app)
        .delete('/api/reviews/1')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('User authentication required');
      expect(response.body.error.field).toBe('x-user-id');
    });

    it('should return 401 for missing authentication in moderation queue', async () => {
      const response = await request(app)
        .get('/api/moderation/queue')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('User authentication required');
      expect(response.body.error.field).toBe('x-user-id');
    });

    it('should return 401 for missing authentication in moderation actions', async () => {
      const response = await request(app)
        .post('/api/moderation/approve/1')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('User authentication required');
      expect(response.body.error.field).toBe('x-user-id');
    });

    it('should return 401 for invalid user ID format', async () => {
      const response = await request(app)
        .put('/api/reviews/1')
        .set('x-user-id', 'invalid')
        .send({
          rating: 4,
          reviewText: 'Updated review'
        })
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('User authentication required');
      expect(response.body.error.field).toBe('x-user-id');
    });
  });

  describe('403 Forbidden - Authorization Errors', () => {
    it('should return 403 when user tries to update another user\'s review', async () => {
      const response = await request(app)
        .put('/api/reviews/1') // Review by user 1
        .set('x-user-id', '2') // Different user
        .send({
          rating: 3,
          reviewText: 'Trying to update someone else\'s review'
        })
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('You can only update your own reviews');
      expect(response.body.error.field).toBe('ownership');
    });

    it('should return 403 when user tries to delete another user\'s review', async () => {
      const response = await request(app)
        .delete('/api/reviews/1') // Review by user 1
        .set('x-user-id', '2') // Different user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('You can only delete your own reviews');
      expect(response.body.error.field).toBe('ownership');
    });

    it('should return 403 when non-moderator tries to access moderation queue', async () => {
      const response = await request(app)
        .get('/api/moderation/queue')
        .set('x-user-id', '1') // Regular user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
      expect(response.body.error.field).toBe('role');
    });

    it('should return 403 when non-moderator tries to approve review', async () => {
      const response = await request(app)
        .post('/api/moderation/approve/3')
        .set('x-user-id', '1') // Regular user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
      expect(response.body.error.field).toBe('role');
    });

    it('should return 403 when non-moderator tries to reject review', async () => {
      const response = await request(app)
        .post('/api/moderation/reject/3')
        .set('x-user-id', '1') // Regular user
        .send({ notes: 'Test notes' })
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
      expect(response.body.error.field).toBe('role');
    });

    it('should return 403 when non-moderator tries to flag review', async () => {
      const response = await request(app)
        .post('/api/moderation/flag/1')
        .set('x-user-id', '1') // Regular user
        .send({ notes: 'Test notes' })
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
      expect(response.body.error.field).toBe('role');
    });

    it('should return 403 when moderator tries to moderate their own review', async () => {
      // First create a review by the moderator
      const insertReview = db.prepare(`
        INSERT INTO reviews (id, user_id, product_id, rating, review_text, status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertReview.run(5, 3, 1, 4, 'Moderator review', 'pending'); // Review by moderator

      const response = await request(app)
        .post('/api/moderation/approve/5')
        .set('x-user-id', '3') // Same moderator
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('cannot moderate their own reviews');
      expect(response.body.error.field).toBe('ownership');
    });

    it('should return 403 when non-moderator tries to access moderation history', async () => {
      const response = await request(app)
        .get('/api/moderation/history')
        .set('x-user-id', '1') // Regular user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
      expect(response.body.error.field).toBe('role');
    });

    it('should return 403 when non-moderator tries to access moderation statistics', async () => {
      const response = await request(app)
        .get('/api/moderation/statistics')
        .set('x-user-id', '1') // Regular user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
      expect(response.body.error.field).toBe('role');
    });
  });

  describe('404 Not Found - Resource Not Found Errors', () => {
    it('should return 404 for non-existing review', async () => {
      const response = await request(app)
        .get('/api/reviews/999')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
      expect(response.body.error.field).toBe('id');
    });

    it('should return 404 when trying to update non-existing review', async () => {
      const response = await request(app)
        .put('/api/reviews/999')
        .set('x-user-id', '1')
        .send({
          rating: 4,
          reviewText: 'Updated review'
        })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
      expect(response.body.error.field).toBe('id');
    });

    it('should return 404 when trying to delete non-existing review', async () => {
      const response = await request(app)
        .delete('/api/reviews/999')
        .set('x-user-id', '1')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
      expect(response.body.error.field).toBe('id');
    });

    it('should return 404 when trying to approve non-existing review', async () => {
      const response = await request(app)
        .post('/api/moderation/approve/999')
        .set('x-user-id', '3')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
      expect(response.body.error.field).toBe('id');
    });

    it('should return 404 when trying to reject non-existing review', async () => {
      const response = await request(app)
        .post('/api/moderation/reject/999')
        .set('x-user-id', '3')
        .send({ notes: 'Test notes' })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
      expect(response.body.error.field).toBe('id');
    });

    it('should return 404 when trying to flag non-existing review', async () => {
      const response = await request(app)
        .post('/api/moderation/flag/999')
        .set('x-user-id', '3')
        .send({ notes: 'Test notes' })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
      expect(response.body.error.field).toBe('id');
    });

    it('should return 404 for non-existing user in moderation queue', async () => {
      const response = await request(app)
        .get('/api/moderation/queue')
        .set('x-user-id', '999') // Non-existing user
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('User not found');
      expect(response.body.error.field).toBe('x-user-id');
    });

    it('should return 404 for non-existing user in moderation actions', async () => {
      const response = await request(app)
        .post('/api/moderation/approve/3')
        .set('x-user-id', '999') // Non-existing user
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('User not found');
      expect(response.body.error.field).toBe('x-user-id');
    });
  });

  describe('Error Response Format Consistency', () => {
    it('should have consistent error response format for validation errors', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          userId: 1,
          productId: 1,
          rating: 6, // Invalid rating
          reviewText: 'Test review'
        })
        .expect(400);

      // Check error response structure
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('field');
      
      expect(typeof response.body.error.code).toBe('string');
      expect(typeof response.body.error.message).toBe('string');
      expect(typeof response.body.error.field).toBe('string');
    });

    it('should have consistent error response format for authentication errors', async () => {
      const response = await request(app)
        .put('/api/reviews/1')
        .send({
          rating: 4,
          reviewText: 'Updated review'
        })
        .expect(401);

      // Check error response structure
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('field');
      
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(typeof response.body.error.message).toBe('string');
      expect(typeof response.body.error.field).toBe('string');
    });

    it('should have consistent error response format for authorization errors', async () => {
      const response = await request(app)
        .put('/api/reviews/1')
        .set('x-user-id', '2') // Different user
        .send({
          rating: 4,
          reviewText: 'Updated review'
        })
        .expect(403);

      // Check error response structure
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('field');
      
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(typeof response.body.error.message).toBe('string');
      expect(typeof response.body.error.field).toBe('string');
    });

    it('should have consistent error response format for not found errors', async () => {
      const response = await request(app)
        .get('/api/reviews/999')
        .expect(404);

      // Check error response structure
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('field');
      
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(typeof response.body.error.message).toBe('string');
      expect(typeof response.body.error.field).toBe('string');
    });
  });

  describe('500 Internal Server Error - Database Errors', () => {
    it('should handle database errors gracefully', async () => {
      // Close the database to simulate database error
      db.close();
      
      const response = await request(app)
        .post('/api/reviews')
        .send({
          userId: 1,
          productId: 1,
          rating: 4,
          reviewText: 'Test review'
        })
        .expect(500);

      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.body.error.message).toContain('Failed to create review');
    });
  });
});