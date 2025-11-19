import express from 'express';
import ModerationService from '../services/ModerationService.js';
import { authenticate } from '../middleware/auth.js';
import { requireModerator } from '../middleware/moderator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const moderationService = new ModerationService();

/**
 * GET /api/moderation/queue - Get pending reviews for moderation
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
router.get('/queue', async (req, res) => {
  try {
    // Get moderator ID from headers (simple auth simulation)
    const moderatorId = parseInt(req.headers['x-user-id']);

    if (!moderatorId || isNaN(moderatorId)) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User authentication required',
          field: 'x-user-id'
        }
      });
    }

    const pendingReviews = await moderationService.getPendingQueue(moderatorId);
    
    res.status(200).json(pendingReviews);
  } catch (error) {
    console.error('Error retrieving moderation queue:', error);
    
    if (error.message.includes('Access denied') || error.message.includes('Moderator privileges required')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Access denied: Moderator privileges required',
          field: 'role'
        }
      });
    }

    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
          field: 'x-user-id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve moderation queue'
      }
    });
  }
});

/**
 * GET /api/moderation/flagged - Get flagged reviews for moderation
 * Requirements: 6.5
 */
router.get('/flagged', async (req, res) => {
  try {
    // Get moderator ID from headers (simple auth simulation)
    const moderatorId = parseInt(req.headers['x-user-id']);

    if (!moderatorId || isNaN(moderatorId)) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User authentication required',
          field: 'x-user-id'
        }
      });
    }

    const flaggedReviews = await moderationService.getFlaggedReviews(moderatorId);
    
    res.status(200).json(flaggedReviews);
  } catch (error) {
    console.error('Error retrieving flagged reviews:', error);
    
    if (error.message.includes('Access denied') || error.message.includes('Moderator privileges required')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Access denied: Moderator privileges required',
          field: 'role'
        }
      });
    }

    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
          field: 'x-user-id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve flagged reviews'
      }
    });
  }
});

/**
 * POST /api/moderation/approve/:id - Approve a review
 * Requirements: 5.1, 5.2, 5.5
 */
router.post('/approve/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // Get moderator ID from headers (simple auth simulation)
    const moderatorId = parseInt(req.headers['x-user-id']);

    if (isNaN(reviewId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Review ID must be a valid number',
          field: 'id'
        }
      });
    }

    if (!moderatorId || isNaN(moderatorId)) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User authentication required',
          field: 'x-user-id'
        }
      });
    }

    const updatedReview = await moderationService.approveReview(reviewId, moderatorId);
    
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error approving review:', error);
    
    if (error.message.includes('Access denied') || error.message.includes('Moderator privileges required')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Access denied: Moderator privileges required',
          field: 'role'
        }
      });
    }

    if (error.message.includes('cannot moderate their own reviews')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Moderators cannot moderate their own reviews',
          field: 'ownership'
        }
      });
    }

    if (error.message.includes('Review not found') || error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message.includes('Review not found') ? 'Review not found' : 'User not found',
          field: error.message.includes('Review not found') ? 'id' : 'x-user-id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to approve review'
      }
    });
  }
});

/**
 * POST /api/moderation/reject/:id - Reject a review
 * Requirements: 5.3, 5.4, 5.5
 */
router.post('/reject/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { notes } = req.body;
    
    // Get moderator ID from headers (simple auth simulation)
    const moderatorId = parseInt(req.headers['x-user-id']);

    if (isNaN(reviewId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Review ID must be a valid number',
          field: 'id'
        }
      });
    }

    if (!moderatorId || isNaN(moderatorId)) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User authentication required',
          field: 'x-user-id'
        }
      });
    }

    const updatedReview = await moderationService.rejectReview(reviewId, moderatorId, notes || '');
    
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error rejecting review:', error);
    
    if (error.message.includes('Access denied') || error.message.includes('Moderator privileges required')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Access denied: Moderator privileges required',
          field: 'role'
        }
      });
    }

    if (error.message.includes('cannot moderate their own reviews')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Moderators cannot moderate their own reviews',
          field: 'ownership'
        }
      });
    }

    if (error.message.includes('Review not found') || error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message.includes('Review not found') ? 'Review not found' : 'User not found',
          field: error.message.includes('Review not found') ? 'id' : 'x-user-id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reject review'
      }
    });
  }
});

/**
 * POST /api/moderation/flag/:id - Flag a review
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
router.post('/flag/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { notes } = req.body;
    
    // Get moderator ID from headers (simple auth simulation)
    const moderatorId = parseInt(req.headers['x-user-id']);

    if (isNaN(reviewId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Review ID must be a valid number',
          field: 'id'
        }
      });
    }

    if (!moderatorId || isNaN(moderatorId)) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User authentication required',
          field: 'x-user-id'
        }
      });
    }

    const updatedReview = await moderationService.flagReview(reviewId, moderatorId, notes || '');
    
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error flagging review:', error);
    
    if (error.message.includes('Access denied') || error.message.includes('Moderator privileges required')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Access denied: Moderator privileges required',
          field: 'role'
        }
      });
    }

    if (error.message.includes('cannot moderate their own reviews')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Moderators cannot moderate their own reviews',
          field: 'ownership'
        }
      });
    }

    if (error.message.includes('Review not found') || error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message.includes('Review not found') ? 'Review not found' : 'User not found',
          field: error.message.includes('Review not found') ? 'id' : 'x-user-id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to flag review'
      }
    });
  }
});

/**
 * GET /api/moderation/history - Get moderation action history
 * Requirements: 7.2, 7.5
 */
router.get('/history', async (req, res) => {
  try {
    // Get moderator ID from headers (simple auth simulation)
    const moderatorId = parseInt(req.headers['x-user-id']);

    if (!moderatorId || isNaN(moderatorId)) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User authentication required',
          field: 'x-user-id'
        }
      });
    }

    // Parse optional query parameters for filtering
    const { startDate, endDate, filterModeratorId } = req.query;
    
    let parsedStartDate = null;
    let parsedEndDate = null;
    let parsedFilterModeratorId = null;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid startDate format. Use ISO 8601 format (YYYY-MM-DD)',
            field: 'startDate'
          }
        });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid endDate format. Use ISO 8601 format (YYYY-MM-DD)',
            field: 'endDate'
          }
        });
      }
    }

    if (filterModeratorId) {
      parsedFilterModeratorId = parseInt(filterModeratorId);
      if (isNaN(parsedFilterModeratorId)) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'filterModeratorId must be a valid number',
            field: 'filterModeratorId'
          }
        });
      }
    }

    const history = await moderationService.getModerationHistory(
      moderatorId, 
      parsedStartDate, 
      parsedEndDate, 
      parsedFilterModeratorId
    );
    
    res.status(200).json(history);
  } catch (error) {
    console.error('Error retrieving moderation history:', error);
    
    if (error.message.includes('Access denied') || error.message.includes('Moderator privileges required')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Access denied: Moderator privileges required',
          field: 'role'
        }
      });
    }

    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
          field: 'x-user-id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve moderation history'
      }
    });
  }
});

/**
 * GET /api/moderation/statistics - Get moderation statistics
 * Requirements: 7.1, 7.3, 7.4
 */
router.get('/statistics', async (req, res) => {
  try {
    // Get moderator ID from headers (simple auth simulation)
    const moderatorId = parseInt(req.headers['x-user-id']);

    if (!moderatorId || isNaN(moderatorId)) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User authentication required',
          field: 'x-user-id'
        }
      });
    }

    // Parse optional query parameters for date range filtering
    const { startDate, endDate } = req.query;
    
    let parsedStartDate = null;
    let parsedEndDate = null;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid startDate format. Use ISO 8601 format (YYYY-MM-DD)',
            field: 'startDate'
          }
        });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid endDate format. Use ISO 8601 format (YYYY-MM-DD)',
            field: 'endDate'
          }
        });
      }
    }

    const statistics = await moderationService.getStatistics(moderatorId, parsedStartDate, parsedEndDate);
    
    res.status(200).json(statistics);
  } catch (error) {
    console.error('Error retrieving moderation statistics:', error);
    
    if (error.message.includes('Access denied') || error.message.includes('Moderator privileges required')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Access denied: Moderator privileges required',
          field: 'role'
        }
      });
    }

    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
          field: 'x-user-id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve moderation statistics'
      }
    });
  }
});

export default router;