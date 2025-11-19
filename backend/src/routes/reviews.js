import express from 'express';
import ReviewService from '../services/ReviewService.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const reviewService = new ReviewService();

/**
 * POST /api/reviews - Create a new review
 * Requirements: 1.1, 1.2, 1.3
 */
router.post('/', async (req, res) => {
  try {
    const { userId, productId, rating, reviewText } = req.body;

    // Basic input validation
    if (!userId || !productId || !rating || !reviewText) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: userId, productId, rating, reviewText',
          field: 'body'
        }
      });
    }

    // Convert to appropriate types
    const userIdNum = parseInt(userId);
    const productIdNum = parseInt(productId);
    const ratingNum = parseInt(rating);

    if (isNaN(userIdNum) || isNaN(productIdNum) || isNaN(ratingNum)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'userId, productId, and rating must be valid numbers',
          field: 'body'
        }
      });
    }

    const review = await reviewService.createReview(userIdNum, productIdNum, ratingNum, reviewText);
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error.message.includes('Rating must be') || 
        error.message.includes('Review text') ||
        error.message.includes('not found')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          field: error.message.includes('Rating') ? 'rating' : 
                 error.message.includes('Review text') ? 'reviewText' :
                 error.message.includes('User not found') ? 'userId' : 'productId'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create review'
      }
    });
  }
});

/**
 * GET /api/reviews/:id - Get a specific review
 * Requirements: 2.5
 */
router.get('/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);

    if (isNaN(reviewId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Review ID must be a valid number',
          field: 'id'
        }
      });
    }

    const review = await reviewService.getReview(reviewId);
    
    if (!review) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Review not found',
          field: 'id'
        }
      });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error('Error retrieving review:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve review'
      }
    });
  }
});

/**
 * PUT /api/reviews/:id - Update own review
 * Requirements: 3.1, 3.2, 3.4, 3.5
 */
router.put('/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    const { rating, reviewText } = req.body;
    
    // Get userId from headers (simple auth simulation)
    const userId = parseInt(req.headers['x-user-id']);

    if (isNaN(reviewId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Review ID must be a valid number',
          field: 'id'
        }
      });
    }

    if (!userId || isNaN(userId)) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User authentication required',
          field: 'x-user-id'
        }
      });
    }

    if (!rating || !reviewText) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: rating, reviewText',
          field: 'body'
        }
      });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rating must be a valid number',
          field: 'rating'
        }
      });
    }

    const updatedReview = await reviewService.updateReview(reviewId, userId, ratingNum, reviewText);
    
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    
    if (error.message.includes('You can only update your own reviews')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You can only update your own reviews',
          field: 'ownership'
        }
      });
    }

    if (error.message.includes('Review not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Review not found',
          field: 'id'
        }
      });
    }

    if (error.message.includes('Rating must be') || error.message.includes('Review text')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          field: error.message.includes('Rating') ? 'rating' : 'reviewText'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update review'
      }
    });
  }
});

/**
 * DELETE /api/reviews/:id - Delete own review
 * Requirements: 3.3, 3.5
 */
router.delete('/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    
    // Get userId from headers (simple auth simulation)
    const userId = parseInt(req.headers['x-user-id']);

    if (isNaN(reviewId)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Review ID must be a valid number',
          field: 'id'
        }
      });
    }

    if (!userId || isNaN(userId)) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User authentication required',
          field: 'x-user-id'
        }
      });
    }

    await reviewService.deleteReview(reviewId, userId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    
    if (error.message.includes('You can only delete your own reviews')) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You can only delete your own reviews',
          field: 'ownership'
        }
      });
    }

    if (error.message.includes('Review not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Review not found',
          field: 'id'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete review'
      }
    });
  }
});

export default router;