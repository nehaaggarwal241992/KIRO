class Review {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.productId = data.productId || null;
    this.rating = data.rating || null;
    this.reviewText = data.reviewText || '';
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validates the review data
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // User ID validation
    if (!this.userId || typeof this.userId !== 'number') {
      errors.push('User ID is required and must be a number');
    }

    // Product ID validation
    if (!this.productId || typeof this.productId !== 'number') {
      errors.push('Product ID is required and must be a number');
    }

    // Rating validation (1-5 range)
    if (!this.isValidRating(this.rating)) {
      errors.push('Rating must be a number between 1 and 5');
    }

    // Review text validation
    if (!this.reviewText || this.reviewText.trim().length === 0) {
      errors.push('Review text is required');
    } else if (this.reviewText.length > 5000) {
      errors.push('Review text must not exceed 5000 characters');
    }

    // Status validation
    if (!this.isValidStatus(this.status)) {
      errors.push('Status must be one of: pending, approved, rejected, flagged');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates rating to ensure it's between 1 and 5
   * @param {number} rating 
   * @returns {boolean}
   */
  isValidRating(rating) {
    return typeof rating === 'number' && 
           Number.isInteger(rating) && 
           rating >= 1 && 
           rating <= 5;
  }

  /**
   * Validates status to ensure it's one of the allowed values
   * @param {string} status 
   * @returns {boolean}
   */
  isValidStatus(status) {
    const validStatuses = ['pending', 'approved', 'rejected', 'flagged'];
    return validStatuses.includes(status);
  }

  /**
   * Returns a plain object representation of the review
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      productId: this.productId,
      rating: this.rating,
      reviewText: this.reviewText,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Creates a Review instance from database row data
   * @param {Object} row - Database row data
   * @returns {Review}
   */
  static fromRow(row) {
    return new Review({
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      rating: row.rating,
      reviewText: row.review_text,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }
}

export default Review;