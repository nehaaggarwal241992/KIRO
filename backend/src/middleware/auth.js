/**
 * Authentication middleware for the Review System
 * Validates user authentication and attaches user object to request
 */

import UserRepository from '../repositories/UserRepository.js';
import { createError } from './errorHandler.js';

const userRepository = new UserRepository();

/**
 * Authentication middleware that validates user identity
 * Extracts userId from x-user-id header and attaches user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract user ID from header (simplified authentication)
    // In a real application, this would validate JWT tokens
    const userId = req.headers['x-user-id'];

    if (!userId) {
      throw createError('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Validate that userId is a number
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      throw createError('Invalid user ID format', 401, 'INVALID_USER_ID');
    }

    // Get user from database
    const user = await userRepository.getById(parsedUserId);
    
    if (!user) {
      throw createError('Invalid user credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware that doesn't fail if no user is provided
 * Used for endpoints that work for both authenticated and anonymous users
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];

    if (userId) {
      const parsedUserId = parseInt(userId, 10);
      if (!isNaN(parsedUserId) && parsedUserId > 0) {
        const user = await userRepository.getById(parsedUserId);
        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on errors, just continue without user
    next();
  }
};

export {
  authenticate,
  optionalAuthenticate
};