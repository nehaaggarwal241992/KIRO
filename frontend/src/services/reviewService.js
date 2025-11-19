import api from './api.js';

export const reviewService = {
  // Create a new review
  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get a specific review by ID
  async getReview(reviewId) {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  },

  // Update an existing review
  async updateReview(reviewId, reviewData) {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  async deleteReview(reviewId) {
    await api.delete(`/reviews/${reviewId}`);
    return true;
  },

  // Get all approved reviews for a product
  async getProductReviews(productId) {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  // Get product rating statistics
  async getProductRating(productId) {
    const response = await api.get(`/products/${productId}/rating`);
    return response.data;
  },

  // Get user's own reviews (Note: This endpoint may not exist in backend, using alternative approach)
  async getUserReviews(userId) {
    // Since there's no specific endpoint for user reviews in the backend,
    // this would need to be implemented or we could fetch all reviews and filter client-side
    // For now, this is a placeholder that matches the expected API structure
    const response = await api.get(`/users/${userId}/reviews`);
    return response.data;
  },
};

export default reviewService;