import { useState, useEffect, useCallback } from 'react';
import reviewService from '../services/reviewService.js';

// Hook for fetching reviews for a specific product
export const useProductReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await reviewService.getProductReviews(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching product reviews:', err);
      setError(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const refetch = useCallback(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching user's own reviews
export const useUserReviews = (userId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await reviewService.getUserReviews(userId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const refetch = useCallback(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch,
  };
};

// Hook for managing review CRUD operations
export const useReviewActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReview = useCallback(async (reviewData, onSuccess) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reviewService.createReview(reviewData);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      console.error('Error creating review:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReview = useCallback(async (reviewId, reviewData, onSuccess) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reviewService.updateReview(reviewId, reviewData);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      console.error('Error updating review:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (reviewId, onSuccess) => {
    setLoading(true);
    setError(null);
    
    try {
      await reviewService.deleteReview(reviewId);
      if (onSuccess) {
        onSuccess(reviewId);
      }
      return true;
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createReview,
    updateReview,
    deleteReview,
    clearError,
  };
};

// Hook for fetching product rating statistics
export const useProductRating = (productId) => {
  const [rating, setRating] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRating = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await reviewService.getProductRating(productId);
      setRating(data || { averageRating: 0, reviewCount: 0 });
    } catch (err) {
      console.error('Error fetching product rating:', err);
      setError(err);
      setRating({ averageRating: 0, reviewCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchRating();
  }, [fetchRating]);

  const refetch = useCallback(() => {
    fetchRating();
  }, [fetchRating]);

  return {
    rating,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching a single review
export const useReview = (reviewId) => {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReview = useCallback(async () => {
    if (!reviewId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await reviewService.getReview(reviewId);
      setReview(data);
    } catch (err) {
      console.error('Error fetching review:', err);
      setError(err);
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const refetch = useCallback(() => {
    fetchReview();
  }, [fetchReview]);

  return {
    review,
    loading,
    error,
    refetch,
  };
};

// Main hook that combines multiple review-related hooks
export const useReviews = (options = {}) => {
  const { productId, userId, reviewId } = options;
  
  const productReviews = useProductReviews(productId);
  const userReviews = useUserReviews(userId);
  const singleReview = useReview(reviewId);
  const productRating = useProductRating(productId);
  const actions = useReviewActions();

  // Refetch all data
  const refetchAll = useCallback(() => {
    if (productId) {
      productReviews.refetch();
      productRating.refetch();
    }
    if (userId) {
      userReviews.refetch();
    }
    if (reviewId) {
      singleReview.refetch();
    }
  }, [productId, userId, reviewId, productReviews, userReviews, singleReview, productRating]);

  return {
    // Product reviews
    productReviews: productReviews.reviews,
    productReviewsLoading: productReviews.loading,
    productReviewsError: productReviews.error,
    refetchProductReviews: productReviews.refetch,
    
    // User reviews
    userReviews: userReviews.reviews,
    userReviewsLoading: userReviews.loading,
    userReviewsError: userReviews.error,
    refetchUserReviews: userReviews.refetch,
    
    // Single review
    review: singleReview.review,
    reviewLoading: singleReview.loading,
    reviewError: singleReview.error,
    refetchReview: singleReview.refetch,
    
    // Product rating
    productRating: productRating.rating,
    productRatingLoading: productRating.loading,
    productRatingError: productRating.error,
    refetchProductRating: productRating.refetch,
    
    // Actions
    actionsLoading: actions.loading,
    actionsError: actions.error,
    createReview: actions.createReview,
    updateReview: actions.updateReview,
    deleteReview: actions.deleteReview,
    clearActionsError: actions.clearError,
    
    // Utility
    refetchAll,
  };
};

export default useReviews;