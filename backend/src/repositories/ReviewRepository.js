import db from '../config/databaseLoader.js';
import { getTestDatabase } from '../config/testDatabase.js';
import Review from '../models/Review.js';

class ReviewRepository {
  constructor() {
    // Use test database if available, otherwise use regular database
    const database = getTestDatabase() || db;
    
    // Prepare statements for better performance
    this.createStmt = database.prepare(`
      INSERT INTO reviews (user_id, product_id, rating, review_text, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);

    this.getByIdStmt = database.prepare(`
      SELECT * FROM reviews WHERE id = ?
    `);

    this.getByProductStmt = database.prepare(`
      SELECT * FROM reviews 
      WHERE product_id = ? AND status = ?
      ORDER BY created_at DESC
    `);

    this.getByProductAllStatusStmt = database.prepare(`
      SELECT * FROM reviews 
      WHERE product_id = ?
      ORDER BY created_at DESC
    `);

    this.getByUserStmt = database.prepare(`
      SELECT * FROM reviews 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    this.getPendingStmt = database.prepare(`
      SELECT * FROM reviews 
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `);

    this.getFlaggedStmt = database.prepare(`
      SELECT * FROM reviews 
      WHERE status = 'flagged'
      ORDER BY created_at DESC
    `);

    this.updateStmt = database.prepare(`
      UPDATE reviews 
      SET rating = ?, review_text = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    this.updateStatusStmt = database.prepare(`
      UPDATE reviews 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    this.deleteStmt = database.prepare(`
      DELETE FROM reviews WHERE id = ?
    `);

    this.getAverageRatingStmt = database.prepare(`
      SELECT AVG(CAST(rating AS REAL)) as average_rating
      FROM reviews 
      WHERE product_id = ? AND status = 'approved'
    `);

    this.getReviewCountStmt = database.prepare(`
      SELECT COUNT(*) as count
      FROM reviews 
      WHERE product_id = ? AND status = ?
    `);
  }

  /**
   * Create a new review with pending status
   * @param {number} userId - User ID
   * @param {number} productId - Product ID
   * @param {number} rating - Rating (1-5)
   * @param {string} reviewText - Review text content
   * @returns {Review} The created review
   * @throws {Error} If review creation fails
   */
  create(userId, productId, rating, reviewText) {
    try {
      // Validate input
      const review = new Review({ userId, productId, rating, reviewText, status: 'pending' });
      const validation = review.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Insert review using prepared statement
      const result = this.createStmt.run(userId, productId, rating, reviewText);
      
      // Return the created review with the new ID
      return new Review({
        id: result.lastInsertRowid,
        userId,
        productId,
        rating,
        reviewText,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
  }

  /**
   * Retrieve review by ID
   * @param {number} reviewId - The review ID
   * @returns {Review|null} The review or null if not found
   */
  getById(reviewId) {
    try {
      const row = this.getByIdStmt.get(reviewId);
      return row ? Review.fromRow(row) : null;
    } catch (error) {
      throw new Error(`Failed to retrieve review by ID: ${error.message}`);
    }
  }

  /**
   * Retrieve reviews by product with status filtering
   * @param {number} productId - The product ID
   * @param {string} status - Optional status filter (default: 'approved')
   * @returns {Review[]} Array of reviews
   */
  getByProduct(productId, status = 'approved') {
    try {
      let rows;
      if (status) {
        rows = this.getByProductStmt.all(productId, status);
      } else {
        rows = this.getByProductAllStatusStmt.all(productId);
      }
      return rows.map(row => Review.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to retrieve reviews by product: ${error.message}`);
    }
  }

  /**
   * Retrieve user's reviews
   * @param {number} userId - The user ID
   * @returns {Review[]} Array of user's reviews
   */
  getByUser(userId) {
    try {
      const rows = this.getByUserStmt.all(userId);
      return rows.map(row => Review.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to retrieve reviews by user: ${error.message}`);
    }
  }

  /**
   * Retrieve pending reviews for moderation queue
   * @returns {Review[]} Array of pending reviews ordered by oldest first
   */
  getPending() {
    try {
      const rows = this.getPendingStmt.all();
      return rows.map(row => Review.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to retrieve pending reviews: ${error.message}`);
    }
  }

  /**
   * Retrieve flagged reviews
   * @returns {Review[]} Array of flagged reviews
   */
  getFlagged() {
    try {
      const rows = this.getFlaggedStmt.all();
      return rows.map(row => Review.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to retrieve flagged reviews: ${error.message}`);
    }
  }

  /**
   * Update review content and rating
   * @param {number} reviewId - The review ID
   * @param {number} rating - New rating
   * @param {string} reviewText - New review text
   * @returns {Review|null} The updated review or null if not found
   */
  update(reviewId, rating, reviewText) {
    try {
      // Validate input
      const review = new Review({ rating, reviewText });
      const validation = review.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Update review using prepared statement
      const result = this.updateStmt.run(rating, reviewText, reviewId);
      
      if (result.changes === 0) {
        return null; // Review not found
      }

      // Return the updated review
      return this.getById(reviewId);
    } catch (error) {
      throw new Error(`Failed to update review: ${error.message}`);
    }
  }

  /**
   * Update review status
   * @param {number} reviewId - The review ID
   * @param {string} status - New status
   * @returns {Review|null} The updated review or null if not found
   */
  updateStatus(reviewId, status) {
    try {
      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected', 'flagged'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      // Update status using prepared statement
      const result = this.updateStatusStmt.run(status, reviewId);
      
      if (result.changes === 0) {
        return null; // Review not found
      }

      // Return the updated review
      return this.getById(reviewId);
    } catch (error) {
      throw new Error(`Failed to update review status: ${error.message}`);
    }
  }

  /**
   * Delete a review
   * @param {number} reviewId - The review ID
   * @returns {boolean} True if review was deleted, false if not found
   */
  delete(reviewId) {
    try {
      const result = this.deleteStmt.run(reviewId);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  /**
   * Get average rating for a product using SQL AVG aggregation
   * @param {number} productId - The product ID
   * @returns {number} Average rating (0 if no approved reviews)
   */
  async getAverageRating(productId) {
    try {
      let row;
      const database = getTestDatabase() || db;
      
      if (!this.getAverageRatingStmt || database.prepare().run?.constructor.name === 'AsyncFunction') {
        // PostgreSQL (async)
        const stmt = database.prepare(`
          SELECT AVG(CAST(rating AS REAL)) as average_rating
          FROM reviews 
          WHERE product_id = $1 AND status = 'approved'
        `);
        const result = await stmt.get(productId);
        row = result;
      } else {
        // SQLite (sync)
        row = this.getAverageRatingStmt.get(productId);
      }
      
      return row && row.average_rating ? parseFloat(row.average_rating) : 0;
    } catch (error) {
      throw new Error(`Failed to get average rating: ${error.message}`);
    }
  }

  /**
   * Get review count for a product with status filtering
   * @param {number} productId - The product ID
   * @param {string} status - Status filter (default: 'approved')
   * @returns {number} Number of reviews
   */
  async getReviewCount(productId, status = 'approved') {
    try {
      let row;
      const database = getTestDatabase() || db;
      
      if (!this.getReviewCountStmt || database.prepare().run?.constructor.name === 'AsyncFunction') {
        // PostgreSQL (async)
        const stmt = database.prepare(`
          SELECT COUNT(*) as count
          FROM reviews 
          WHERE product_id = $1 AND status = $2
        `);
        const result = await stmt.get(productId, status);
        row = result;
      } else {
        // SQLite (sync)
        row = this.getReviewCountStmt.get(productId, status);
      }
      
      return row ? parseInt(row.count) : 0;
    } catch (error) {
      throw new Error(`Failed to get review count: ${error.message}`);
    }
  }
}

export default ReviewRepository;