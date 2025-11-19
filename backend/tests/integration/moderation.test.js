import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { createTestDatabase, seedTestData } from '../helpers/testDatabase.js';
import { setTestDatabase, clearTestDatabase } from '../../src/config/testDatabase.js';

// Import routes and middleware
import moderationRoutes from '../../src/routes/moderation.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Moderation API Integration Tests', () => {
  let app;
  let db;

  beforeEach(() => {
    // Create test database in memory
    db = createTestDatabase();
    
    // Seed test data
    seedTestData(db);
    
    // Add additional test data for moderation tests
    const insertModerationAction = db.prepare(`
      INSERT INTO moderation_actions (id, review_id, moderator_id, action, notes) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    // Add some moderation actions for history testing
    insertModerationAction.run(1, 1, 3, 'approve', 'Good review');
    insertModerationAction.run(2, 2, 3, 'approve', 'Acceptable review');
    
    // Set test database for repositories
    setTestDatabase(db);

    // Set up Express app
    app = express();
    app.use(cors());
    app.use(express.json());

    app.use('/api/moderation', moderationRoutes);
    app.use(errorHandler);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
    clearTestDatabase();
  });

  describe('GET /api/moderation/queue', () => {
    it('should return pending reviews for moderators', async () => {
      const response = await request(app)
        .get('/api/moderation/queue')
        .set('x-user-id', '3') // Moderator user
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1); // Only one pending review
      expect(response.body[0].status).toBe('pending');
      expect(response.body[0].id).toBe(3); // The pending review
    });

    it('should return 403 for non-moderator users', async () => {
      const response = await request(app)
        .get('/api/moderation/queue')
        .set('x-user-id', '1') // Regular user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get('/api/moderation/queue')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 404 for non-existing user', async () => {
      const response = await request(app)
        .get('/api/moderation/queue')
        .set('x-user-id', '999') // Non-existing user
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('User not found');
    });
  });

  describe('GET /api/moderation/flagged', () => {
    it('should return flagged reviews for moderators', async () => {
      const response = await request(app)
        .get('/api/moderation/flagged')
        .set('x-user-id', '3') // Moderator user
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1); // Only one flagged review
      expect(response.body[0].status).toBe('flagged');
      expect(response.body[0].id).toBe(4); // The flagged review
    });

    it('should return 403 for non-moderator users', async () => {
      const response = await request(app)
        .get('/api/moderation/flagged')
        .set('x-user-id', '1') // Regular user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get('/api/moderation/flagged')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('POST /api/moderation/approve/:id', () => {
    it('should approve a pending review successfully', async () => {
      const response = await request(app)
        .post('/api/moderation/approve/3') // Pending review
        .set('x-user-id', '3') // Moderator user
        .expect(200);

      expect(response.body.id).toBe(3);
      expect(response.body.status).toBe('approved');
    });

    it('should return 403 for non-moderator users', async () => {
      const response = await request(app)
        .post('/api/moderation/approve/3')
        .set('x-user-id', '1') // Regular user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
    });

    it('should return 403 when moderator tries to approve their own review', async () => {
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
    });

    it('should return 404 for non-existing review', async () => {
      const response = await request(app)
        .post('/api/moderation/approve/999')
        .set('x-user-id', '3')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
    });

    it('should return 400 for invalid review ID', async () => {
      const response = await request(app)
        .post('/api/moderation/approve/invalid')
        .set('x-user-id', '3')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be a valid number');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .post('/api/moderation/approve/3')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('POST /api/moderation/reject/:id', () => {
    it('should reject a pending review successfully', async () => {
      const response = await request(app)
        .post('/api/moderation/reject/3') // Pending review
        .set('x-user-id', '3') // Moderator user
        .send({ notes: 'Inappropriate content' })
        .expect(200);

      expect(response.body.id).toBe(3);
      expect(response.body.status).toBe('rejected');
    });

    it('should reject a review without notes', async () => {
      const response = await request(app)
        .post('/api/moderation/reject/3')
        .set('x-user-id', '3')
        .send({}) // No notes
        .expect(200);

      expect(response.body.id).toBe(3);
      expect(response.body.status).toBe('rejected');
    });

    it('should return 403 for non-moderator users', async () => {
      const response = await request(app)
        .post('/api/moderation/reject/3')
        .set('x-user-id', '1') // Regular user
        .send({ notes: 'Test notes' })
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
    });

    it('should return 403 when moderator tries to reject their own review', async () => {
      // First create a review by the moderator
      const insertReview = db.prepare(`
        INSERT INTO reviews (id, user_id, product_id, rating, review_text, status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertReview.run(6, 3, 1, 4, 'Moderator review', 'pending'); // Review by moderator

      const response = await request(app)
        .post('/api/moderation/reject/6')
        .set('x-user-id', '3') // Same moderator
        .send({ notes: 'Test notes' })
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('cannot moderate their own reviews');
    });

    it('should return 404 for non-existing review', async () => {
      const response = await request(app)
        .post('/api/moderation/reject/999')
        .set('x-user-id', '3')
        .send({ notes: 'Test notes' })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
    });
  });

  describe('POST /api/moderation/flag/:id', () => {
    it('should flag a review successfully', async () => {
      const response = await request(app)
        .post('/api/moderation/flag/1') // Approved review
        .set('x-user-id', '3') // Moderator user
        .send({ notes: 'Suspicious content' })
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.status).toBe('flagged');
    });

    it('should flag a review without notes', async () => {
      const response = await request(app)
        .post('/api/moderation/flag/1')
        .set('x-user-id', '3')
        .send({}) // No notes
        .expect(200);

      expect(response.body.id).toBe(1);
      expect(response.body.status).toBe('flagged');
    });

    it('should return 403 for non-moderator users', async () => {
      const response = await request(app)
        .post('/api/moderation/flag/1')
        .set('x-user-id', '1') // Regular user
        .send({ notes: 'Test notes' })
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
    });

    it('should return 403 when moderator tries to flag their own review', async () => {
      // First create a review by the moderator
      const insertReview = db.prepare(`
        INSERT INTO reviews (id, user_id, product_id, rating, review_text, status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertReview.run(7, 3, 1, 4, 'Moderator review', 'approved'); // Review by moderator

      const response = await request(app)
        .post('/api/moderation/flag/7')
        .set('x-user-id', '3') // Same moderator
        .send({ notes: 'Test notes' })
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('cannot moderate their own reviews');
    });

    it('should return 404 for non-existing review', async () => {
      const response = await request(app)
        .post('/api/moderation/flag/999')
        .set('x-user-id', '3')
        .send({ notes: 'Test notes' })
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Review not found');
    });
  });

  describe('GET /api/moderation/history', () => {
    it('should return moderation history for moderators', async () => {
      const response = await request(app)
        .get('/api/moderation/history')
        .set('x-user-id', '3') // Moderator user
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Two moderation actions in test data
      expect(response.body[0]).toHaveProperty('action');
      expect(response.body[0]).toHaveProperty('reviewId');
      expect(response.body[0]).toHaveProperty('moderatorId');
    });

    it('should filter history by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const response = await request(app)
        .get(`/api/moderation/history?startDate=${startDate}&endDate=${endDate}`)
        .set('x-user-id', '3')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter history by moderator ID', async () => {
      const response = await request(app)
        .get('/api/moderation/history?filterModeratorId=3')
        .set('x-user-id', '3')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // All actions should be by moderator 3
      response.body.forEach(action => {
        expect(action.moderatorId).toBe(3);
      });
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get('/api/moderation/history?startDate=invalid-date')
        .set('x-user-id', '3')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Invalid startDate format');
    });

    it('should return 400 for invalid moderator ID filter', async () => {
      const response = await request(app)
        .get('/api/moderation/history?filterModeratorId=invalid')
        .set('x-user-id', '3')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('must be a valid number');
    });

    it('should return 403 for non-moderator users', async () => {
      const response = await request(app)
        .get('/api/moderation/history')
        .set('x-user-id', '1') // Regular user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get('/api/moderation/history')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('GET /api/moderation/statistics', () => {
    it('should return moderation statistics for moderators', async () => {
      const response = await request(app)
        .get('/api/moderation/statistics')
        .set('x-user-id', '3') // Moderator user
        .expect(200);

      expect(response.body).toHaveProperty('totalReviews');
      expect(response.body).toHaveProperty('pendingCount');
      expect(response.body).toHaveProperty('approvedCount');
      expect(response.body).toHaveProperty('rejectedCount');
      expect(response.body).toHaveProperty('flaggedCount');
      expect(response.body).toHaveProperty('approvalRate');
      expect(response.body).toHaveProperty('averageProcessingTime');
    });

    it('should filter statistics by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const response = await request(app)
        .get(`/api/moderation/statistics?startDate=${startDate}&endDate=${endDate}`)
        .set('x-user-id', '3')
        .expect(200);

      expect(response.body).toHaveProperty('totalReviews');
      expect(response.body).toHaveProperty('approvalRate');
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .get('/api/moderation/statistics?startDate=invalid-date')
        .set('x-user-id', '3')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Invalid startDate format');
    });

    it('should return 403 for non-moderator users', async () => {
      const response = await request(app)
        .get('/api/moderation/statistics')
        .set('x-user-id', '1') // Regular user
        .expect(403);

      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(response.body.error.message).toContain('Moderator privileges required');
    });

    it('should return 401 for missing authentication', async () => {
      const response = await request(app)
        .get('/api/moderation/statistics')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });
});