import api from './api.js';

export const moderationService = {
  // Get pending reviews queue
  async getPendingQueue() {
    const response = await api.get('/moderation/queue');
    return response.data;
  },

  // Get flagged reviews
  async getFlaggedReviews() {
    const response = await api.get('/moderation/flagged');
    return response.data;
  },

  // Approve a review
  async approveReview(reviewId) {
    const response = await api.post(`/moderation/approve/${reviewId}`);
    return response.data;
  },

  // Reject a review
  async rejectReview(reviewId) {
    const response = await api.post(`/moderation/reject/${reviewId}`);
    return response.data;
  },

  // Flag a review with optional notes
  async flagReview(reviewId, notes = '') {
    const response = await api.post(`/moderation/flag/${reviewId}`, { notes });
    return response.data;
  },

  // Get moderation history with optional filters
  async getModerationHistory(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters.moderatorId) {
      params.append('moderatorId', filters.moderatorId);
    }
    
    const response = await api.get(`/moderation/history?${params.toString()}`);
    return response.data;
  },

  // Get moderation statistics
  async getStatistics() {
    const response = await api.get('/moderation/statistics');
    return response.data;
  },
};

export default moderationService;