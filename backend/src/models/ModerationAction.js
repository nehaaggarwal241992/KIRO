class ModerationAction {
  constructor(data = {}) {
    this.id = data.id || null;
    this.reviewId = data.reviewId || null;
    this.moderatorId = data.moderatorId || null;
    this.action = data.action || '';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Validates the moderation action data
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // Review ID validation
    if (!this.reviewId || typeof this.reviewId !== 'number') {
      errors.push('Review ID is required and must be a number');
    }

    // Moderator ID validation
    if (!this.moderatorId || typeof this.moderatorId !== 'number') {
      errors.push('Moderator ID is required and must be a number');
    }

    // Action validation
    if (!this.isValidAction(this.action)) {
      errors.push('Action must be one of: approve, reject, flag');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates action to ensure it's one of the allowed values
   * @param {string} action 
   * @returns {boolean}
   */
  isValidAction(action) {
    const validActions = ['approve', 'reject', 'flag'];
    return validActions.includes(action);
  }

  /**
   * Returns a plain object representation of the moderation action
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      reviewId: this.reviewId,
      moderatorId: this.moderatorId,
      action: this.action,
      notes: this.notes,
      createdAt: this.createdAt
    };
  }

  /**
   * Creates a ModerationAction instance from database row data
   * @param {Object} row - Database row data
   * @returns {ModerationAction}
   */
  static fromRow(row) {
    return new ModerationAction({
      id: row.id,
      reviewId: row.review_id,
      moderatorId: row.moderator_id,
      action: row.action,
      notes: row.notes,
      createdAt: new Date(row.created_at)
    });
  }
}

export default ModerationAction;