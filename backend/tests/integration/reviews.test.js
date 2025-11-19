import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { createTestDatabase, seedTestData } from '../helpers/testDatabase.js';
import { setTestDatabase, clearTestDatabase } from '../../src/config/testDatabase.js';

// Import routes and middleware
import reviewRoutes from '../../src/routes/reviews.js';
import productRoutes from '../../src/routes/products.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Review API Integration Tests', () => {
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
    app.use(errorHandler);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
    clearTestDatabase();
  });

  describe('POST /api/reviews', () => {
    it('should create a new review with valid data', async () => {
      const reviewData = {
        userId: 1,
        productId: 1,
        rating: 4,
        reviewText: 'This is a test review'
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(reviewData.userId);
      expect(response.body.productId).toBe(reviewData.productId);
      expect(response.body.rating).toBe(reviewData.rating);
      expect(response.body.reviewText).toBe(reviewData.reviewText);
      expect(response.body.status).toBe('pending');
    });

    it('should return 400 for missing required fields', async () => {
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
    });

    it('should return 400 for invalid rating', async () => {
      const reviewData = {
        userId: 1,
        productId: 1,
        rating: 6, // Invalid rating > 5
        reviewText: 'This is a test review'
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Rating must be');
    });

    it('should return 400 for non-numeric IDs', async () => {
      const reviewData = {
        userId: 'invalid',
        productId: 1,
        rating: 4,
        reviewText: 'This is a test review'
      };

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be valid numbers');
    });
  });

  describe('GET /api/reviews/:id', () => {
    it('should return a review by ID', async () => {
      const response = await request(app)
        .get('/api/reviews/1')
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.userId).toBe(1);
      expect(response.body.productId).toBe(1);
      expect(response.body.rating).toBe(5);
      expect(response.body.reviewText).toBe('Great product!');
      expect(response.body.status).toBe('approved');
    });

    it('should return 404 for non-existing review', async () => {
      const response = await request(app)
        .get('/api/reviews/999')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
    });

    it('should return 400 for invalid review ID', async () => {
      const response = await request(app)
        .get('/api/reviews/invalid')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be a valid number');
    });
  });

  describe('PUT /api/reviews/:id', () => {
    it('should update own review successfully', async () => {
      const updateData = {
        rating: 3,
        reviewText: 'Updated review text'
      };

      const response = await request(app)
        .put('/api/reviews/1')
        .set('x-user-id', '1')
        .send(updateData)
        .expect(200);

      expect(response.body.rating).toBe(updateData.rating);
      expect(response.body.reviewText).toBe(updateData.reviewText);
      expect(response.body.status).toBe('pending'); // Should reset to pending
    });

    it('should return 403 when trying to update another user\'s review', async () => {
      const updateData = {
        rating: 3,
        reviewText: 'Updated review text'
      };

      const response = await request(app)
        .put('/api/reviews/1')
        .set('x-user-id', '2') // Different user
        .send(updateData)
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('You can only update your own reviews');
    });

    it('should return 401 for missing authentication', async () => {
      const updateData = {
        rating: 3,
        reviewText: 'Updated review text'
      };

      const response = await request(app)
        .put('/api/reviews/1')
        .send(updateData)
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .put('/api/reviews/1')
        .set('x-user-id', '1')
        .send({}) // Missing rating and reviewText
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Missing required fields');
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('should delete own review successfully', async () => {
      const response = await request(app)
        .delete('/api/reviews/1')
        .set('x-user-id', '1')
        .expect(204);

      // Verify review is deleted
      const getResponse = await request(app)
        .get('/api/reviews/1')
        .expect(404);
    });

    it('should return 403 when trying to delete another user\'s review', async () => {
      const response = await request(app)
        .delete('/api/reviews/1')
        .set('x-user-id', '2') // Different user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('You can only delete your own reviews');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .delete('/api/reviews/1')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 404 for non-existing review', async () => {
      const response = await request(app)
        .delete('/api/reviews/999')
        .set('x-user-id', '1')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/products/:id/reviews', () => {
    it('should return approved reviews for a product', async () => {
      const response = await request(app)
        .get('/api/products/1/reviews')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Only approved reviews
      
      // Should be sorted by most recent first
      expect(response.body[0].status).toBe('approved');
      expect(response.body[1].status).toBe('approved');
    });

    it('should return empty array for product with no approved reviews', async () => {
      const response = await request(app)
        .get('/api/products/2/reviews')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0); // No approved reviews for product 2
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid/reviews')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be a valid number');
    });
  });

  describe('GET /api/products/:id/rating', () => {
    it('should return correct average rating and count', async () => {
      const response = await request(app)
        .get('/api/products/1/rating')
        .expect(200);

      expect(response.body).toHaveProperty('averageRating');
      expect(response.body).toHaveProperty('reviewCount');
      expect(response.body.averageRating).toBe(4.5); // (5 + 4) / 2
      expect(response.body.reviewCount).toBe(2);
    });

    it('should return zero values for product with no approved reviews', async () => {
      const response = await request(app)
        .get('/api/products/2/rating')
        .expect(200);

      expect(response.body.averageRating).toBe(0);
      expect(response.body.reviewCount).toBe(0);
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid/rating')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be a valid number');
    });
  });
});