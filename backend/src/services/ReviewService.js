import ReviewRepository from '../repositories/ReviewRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';

class ReviewService {
  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
  }

  /**
   * Create a new review with validation and pending status
   * @param {number} userId - User ID creating the review
   * @param {number} productId - Product ID being reviewed
   * @param {number} rating - Rating (1-5)
   * @param {string} reviewText - Review text content
   * @returns {Object} Created review object
   * @throws {Error} If validation fails or creation fails
   */
  async createReview(userId, productId, rating, reviewText) {
    try {
      // Validate input parameters
      this._validateReviewInput(rating, reviewText);

      // Verify user exists
      const user = this.userRepository.getById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify product exists
      const product = this.productRepository.getById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Create review with pending status
      const review = this.reviewRepository.create(userId, productId, rating, reviewText);
      
      return {
        id: review.id,
        userId: review.userId,
        productId: review.productId,
        rating: review.rating,
        reviewText: review.reviewText,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      };
    } catch (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
  }

  /**
   * Retrieve a review by ID
   * @param {number} reviewId - Review ID
   * @returns {Object|null} Review object or null if not found
   */
  async getReview(reviewId) {
    try {
      const review = this.reviewRepository.getById(reviewId);
      
      if (!review) {
        return null;
      }

      return {
        id: review.id,
        userId: review.userId,
        productId: review.productId,
        rating: review.rating,
        reviewText: review.reviewText,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      };
    } catch (error) {
      throw new Error(`Failed to retrieve review: ${error.message}`);
    }
  }

  /**
   * Update a review with ownership validation and reset status to pending
   * @param {number} reviewId - Review ID to update
   * @param {number} userId - User ID attempting the update
   * @param {number} rating - New rating
   * @param {string} reviewText - New review text
   * @returns {Object} Updated review object
   * @throws {Error} If validation fails or user doesn't own the review
   */
  async updateReview(reviewId, userId, rating, reviewText) {
    try {
      // Validate input parameters
      this._validateReviewInput(rating, reviewText);

      // Get existing review
      const existingReview = this.reviewRepository.getById(reviewId);
      if (!existingReview) {
        throw new Error('Review not found');
      }

      // Check ownership
      if (existingReview.userId !== userId) {
        throw new Error('You can only update your own reviews');
      }

      // Update review content
      const updatedReview = this.reviewRepository.update(reviewId, rating, reviewText);
      
      if (!updatedReview) {
        throw new Error('Failed to update review');
      }

      // Reset status to pending for re-moderation
      const reviewWithPendingStatus = this.reviewRepository.updateStatus(reviewId, 'pending');

      return {
        id: reviewWithPendingStatus.id,
        userId: reviewWithPendingStatus.userId,
        productId: reviewWithPendingStatus.productId,
        rating: reviewWithPendingStatus.rating,
        reviewText: reviewWithPendingStatus.reviewText,
        status: reviewWithPendingStatus.status,
        createdAt: reviewWithPendingStatus.createdAt,
        updatedAt: reviewWithPendingStatus.updatedAt
      };
    } catch (error) {
      throw new Error(`Failed to update review: ${error.message}`);
    }
  }

  /**
   * Delete a review with ownership validation
   * @param {number} reviewId - Review ID to delete
   * @param {number} userId - User ID attempting the deletion
   * @returns {boolean} True if deleted successfully
   * @throws {Error} If user doesn't own the review or deletion fails
   */
  async deleteReview(reviewId, userId) {
    try {
      // Get existing review
      const existingReview = this.reviewRepository.getById(reviewId);
      if (!existingReview) {
        throw new Error('Review not found');
      }

      // Check ownership
      if (existingReview.userId !== userId) {
        throw new Error('You can only delete your own reviews');
      }

      // Delete review
      const deleted = this.reviewRepository.delete(reviewId);
      
      if (!deleted) {
        throw new Error('Failed to delete review');
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  /**
   * Get approved reviews for a product sorted by date
   * @param {number} productId - Product ID
   * @returns {Object[]} Array of approved reviews sorted by most recent
   */
  async getProductReviews(productId) {
    try {
      // Verify product exists
      const product = this.productRepository.getById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Get only approved reviews
      const reviews = this.reviewRepository.getByProduct(productId, 'approved');
      
      return reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        productId: review.productId,
        rating: review.rating,
        reviewText: review.reviewText,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }));
    } catch (error) {
      throw new Error(`Failed to get product reviews: ${error.message}`);
    }
  }

  /**
   * Get user's own reviews (all statuses)
   * @param {number} userId - User ID
   * @returns {Object[]} Array of user's reviews
   */
  async getUserReviews(userId) {
    try {
      // Verify user exists
      const user = this.userRepository.getById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const reviews = this.reviewRepository.getByUser(userId);
      
      return reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        productId: review.productId,
        rating: review.rating,
        reviewText: review.reviewText,
        status: review.status,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }));
    } catch (error) {
      throw new Error(`Failed to get user reviews: ${error.message}`);
    }
  }

  /**
   * Calculate product statistics (average rating and review count)
   * @param {number} productId - Product ID
   * @returns {Object} Statistics object with average rating and count
   */
  async getProductStatistics(productId) {
    try {
      // Verify product exists
      const product = this.productRepository.getById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Get average rating and count from approved reviews only
      const averageRating = this.reviewRepository.getAverageRating(productId);
      const reviewCount = this.reviewRepository.getReviewCount(productId, 'approved');

      return {
        productId,
        averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        reviewCount,
        productName: product.name
      };
    } catch (error) {
      throw new Error(`Failed to get product statistics: ${error.message}`);
    }
  }

  /**
   * Validate review input parameters
   * @param {number} rating - Rating value
   * @param {string} reviewText - Review text
   * @throws {Error} If validation fails
   * @private
   */
  _validateReviewInput(rating, reviewText) {
    // Validate rating range (1-5)
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }

    // Validate review text length
    if (!reviewText || typeof reviewText !== 'string') {
      throw new Error('Review text is required and must be a string');
    }

    if (reviewText.trim().length === 0) {
      throw new Error('Review text cannot be empty');
    }

    if (reviewText.length > 5000) {
      throw new Error('Review text cannot exceed 5000 characters');
    }
  }
}

export default ReviewService;