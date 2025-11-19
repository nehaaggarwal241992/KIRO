/**
 * Authorization middleware for moderator-only routes
 * Checks if authenticated user has moderator privileges
 */

import UserService from '../services/UserService.js';
import { createError } from './errorHandler.js';

const userService = new UserService();

/**
 * Middleware that checks if the authenticated user is a moderator
 * Requires authentication middleware to be run first (req.user must exist)
 */
const requireModerator = async (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      throw createError('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Verify moderator status using UserService
    const isModerator = await userService.verifyModerator(req.user.id);
    
    if (!isModerator) {
      throw createError('Moderator privileges required', 403, 'FORBIDDEN');
    }

    // User is a moderator, continue to next middleware/route handler
    next();
  } catch (error) {
    // If the error is from verifyModerator and user not found, convert to 401
    if (error.message.includes('User not found')) {
      next(createError('Invalid user credentials', 401, 'INVALID_CREDENTIALS'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware that checks if user can moderate a specific review
 * Prevents moderators from moderating their own reviews
 */
const canModerateReview = (reviewUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401, 'UNAUTHORIZED');
      }

      // Check if user is a moderator
      const isModerator = await userService.verifyModerator(req.user.id);
      
      if (!isModerator) {
        throw createError('Moderator privileges required', 403, 'FORBIDDEN');
      }

      // Check if moderator is trying to moderate their own review
      if (req.user.id === reviewUserId) {
        throw createError('Cannot moderate your own review', 403, 'SELF_MODERATION_FORBIDDEN');
      }

      next();
    } catch (error) {
      if (error.message.includes('User not found')) {
        next(createError('Invalid user credentials', 401, 'INVALID_CREDENTIALS'));
      } else {
        next(error);
      }
    }
  };
};

export {
  requireModerator,
  canModerateReview
};