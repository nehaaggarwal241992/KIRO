import ReviewRepository from '../repositories/ReviewRepository.js';
import ModerationActionRepository from '../repositories/ModerationActionRepository.js';
import UserRepository from '../repositories/UserRepository.js';

class ModerationService {
  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.moderationActionRepository = new ModerationActionRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Get pending reviews for moderation queue ordered by oldest first
   * @param {number} moderatorId - Moderator ID for validation
   * @returns {Object[]} Array of pending reviews
   * @throws {Error} If user is not a moderator
   */
  async getPendingQueue(moderatorId) {
    try {
      // Validate moderator role
      await this._validateModerator(moderatorId);

      const pendingReviews = this.reviewRepository.getPending();
      
      return pendingReviews.map(review => ({
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
      throw new Error(`Failed to get pending queue: ${error.message}`);
    }
  }

  /**
   * Get flagged reviews for moderator review
   * @param {number} moderatorId - Moderator ID for validation
   * @returns {Object[]} Array of flagged reviews
   * @throws {Error} If user is not a moderator
   */
  async getFlaggedReviews(moderatorId) {
    try {
      // Validate moderator role
      await this._validateModerator(moderatorId);

      const flaggedReviews = this.reviewRepository.getFlagged();
      
      return flaggedReviews.map(review => ({
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
      throw new Error(`Failed to get flagged reviews: ${error.message}`);
    }
  }

  /**
   * Approve a review with validation and logging
   * @param {number} reviewId - Review ID to approve
   * @param {number} moderatorId - Moderator ID performing the action
   * @returns {Object} Updated review object
   * @throws {Error} If validation fails or moderator tries to moderate own review
   */
  async approveReview(reviewId, moderatorId) {
    try {
      // Validate moderator role
      await this._validateModerator(moderatorId);

      // Get review to validate it exists and check ownership
      const review = this.reviewRepository.getById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      // Prevent moderators from moderating their own reviews
      if (review.userId === moderatorId) {
        throw new Error('Moderators cannot moderate their own reviews');
      }

      // Update review status to approved
      const updatedReview = this.reviewRepository.updateStatus(reviewId, 'approved');
      if (!updatedReview) {
        throw new Error('Failed to update review status');
      }

      // Log moderation action
      this.moderationActionRepository.create(reviewId, moderatorId, 'approve', '');

      return {
        id: updatedReview.id,
        userId: updatedReview.userId,
        productId: updatedReview.productId,
        rating: updatedReview.rating,
        reviewText: updatedReview.reviewText,
        status: updatedReview.status,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt
      };
    } catch (error) {
      throw new Error(`Failed to approve review: ${error.message}`);
    }
  }

  /**
   * Reject a review with validation and logging
   * @param {number} reviewId - Review ID to reject
   * @param {number} moderatorId - Moderator ID performing the action
   * @param {string} notes - Optional notes explaining the rejection
   * @returns {Object} Updated review object
   * @throws {Error} If validation fails or moderator tries to moderate own review
   */
  async rejectReview(reviewId, moderatorId, notes = '') {
    try {
      // Validate moderator role
      await this._validateModerator(moderatorId);

      // Get review to validate it exists and check ownership
      const review = this.reviewRepository.getById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      // Prevent moderators from moderating their own reviews
      if (review.userId === moderatorId) {
        throw new Error('Moderators cannot moderate their own reviews');
      }

      // Update review status to rejected
      const updatedReview = this.reviewRepository.updateStatus(reviewId, 'rejected');
      if (!updatedReview) {
        throw new Error('Failed to update review status');
      }

      // Log moderation action with notes
      this.moderationActionRepository.create(reviewId, moderatorId, 'reject', notes);

      return {
        id: updatedReview.id,
        userId: updatedReview.userId,
        productId: updatedReview.productId,
        rating: updatedReview.rating,
        reviewText: updatedReview.reviewText,
        status: updatedReview.status,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt
      };
    } catch (error) {
      throw new Error(`Failed to reject review: ${error.message}`);
    }
  }

  /**
   * Flag a review with validation, notes, and logging
   * @param {number} reviewId - Review ID to flag
   * @param {number} moderatorId - Moderator ID performing the action
   * @param {string} notes - Notes explaining why the review was flagged
   * @returns {Object} Updated review object
   * @throws {Error} If validation fails or moderator tries to moderate own review
   */
  async flagReview(reviewId, moderatorId, notes = '') {
    try {
      // Validate moderator role
      await this._validateModerator(moderatorId);

      // Get review to validate it exists and check ownership
      const review = this.reviewRepository.getById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      // Prevent moderators from moderating their own reviews
      if (review.userId === moderatorId) {
        throw new Error('Moderators cannot moderate their own reviews');
      }

      // Update review status to flagged
      const updatedReview = this.reviewRepository.updateStatus(reviewId, 'flagged');
      if (!updatedReview) {
        throw new Error('Failed to update review status');
      }

      // Log moderation action with notes
      this.moderationActionRepository.create(reviewId, moderatorId, 'flag', notes);

      return {
        id: updatedReview.id,
        userId: updatedReview.userId,
        productId: updatedReview.productId,
        rating: updatedReview.rating,
        reviewText: updatedReview.reviewText,
        status: updatedReview.status,
        createdAt: updatedReview.createdAt,
        updatedAt: updatedReview.updatedAt
      };
    } catch (error) {
      throw new Error(`Failed to flag review: ${error.message}`);
    }
  }

  /**
   * Get moderation history with filtering by date range and moderator
   * @param {number} moderatorId - Moderator ID for validation
   * @param {Date} startDate - Optional start date for filtering
   * @param {Date} endDate - Optional end date for filtering
   * @param {number} filterModeratorId - Optional moderator ID to filter by
   * @returns {Object[]} Array of moderation actions
   * @throws {Error} If user is not a moderator
   */
  async getModerationHistory(moderatorId, startDate = null, endDate = null, filterModeratorId = null) {
    try {
      // Validate moderator role
      await this._validateModerator(moderatorId);

      let actions;
      
      if (filterModeratorId) {
        // Get actions by specific moderator
        actions = this.moderationActionRepository.getByModerator(filterModeratorId);
      } else {
        // For now, get all actions (could be optimized with date filtering in repository)
        // This is a simplified implementation - in production, you'd want date filtering in SQL
        actions = this.moderationActionRepository.getByModerator(moderatorId);
      }

      // Apply date filtering if provided
      if (startDate || endDate) {
        actions = actions.filter(action => {
          const actionDate = new Date(action.createdAt);
          if (startDate && actionDate < startDate) return false;
          if (endDate && actionDate > endDate) return false;
          return true;
        });
      }

      return actions.map(action => {
        // Get moderator details
        const moderator = this.userRepository.getById(action.moderatorId);
        
        // Get review details
        const review = this.reviewRepository.getById(action.reviewId);
        
        return {
          id: action.id,
          reviewId: action.reviewId,
          moderatorId: action.moderatorId,
          moderator: moderator ? {
            id: moderator.id,
            username: moderator.username
          } : null,
          review: review ? {
            id: review.id,
            rating: review.rating,
            reviewText: review.reviewText.substring(0, 100) + (review.reviewText.length > 100 ? '...' : ''),
            status: review.status
          } : null,
          action: action.action,
          notes: action.notes,
          createdAt: action.createdAt
        };
      });
    } catch (error) {
      throw new Error(`Failed to get moderation history: ${error.message}`);
    }
  }

  /**
   * Get moderation statistics including approval rate and average processing time
   * @param {number} moderatorId - Moderator ID for validation
   * @param {Date} startDate - Optional start date for filtering
   * @param {Date} endDate - Optional end date for filtering
   * @returns {Object} Statistics object
   * @throws {Error} If user is not a moderator
   */
  async getStatistics(moderatorId, startDate = null, endDate = null) {
    try {
      // Validate moderator role
      await this._validateModerator(moderatorId);

      // Get statistics from repository
      const stats = this.moderationActionRepository.getStatistics(startDate, endDate);

      return {
        actionCounts: stats.actionCounts,
        approvalRate: stats.approvalRate,
        averageProcessingTimeMinutes: stats.averageProcessingTimeMinutes,
        totalActions: stats.totalActions,
        dateRange: stats.dateRange
      };
    } catch (error) {
      throw new Error(`Failed to get moderation statistics: ${error.message}`);
    }
  }

  /**
   * Validate that a user is a moderator
   * @param {number} userId - User ID to validate
   * @throws {Error} If user is not found or not a moderator
   * @private
   */
  async _validateModerator(userId) {
    const user = this.userRepository.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isModerator = this.userRepository.isModerator(userId);
    if (!isModerator) {
      throw new Error('Access denied: Moderator privileges required');
    }
  }
}

export default ModerationService;