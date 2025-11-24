import db from '../config/databaseLoader.js';
import { getTestDatabase } from '../config/testDatabase.js';
import ModerationAction from '../models/ModerationAction.js';

class ModerationActionRepository {
  constructor() {
    // Use test database if available, otherwise use regular database
    const database = getTestDatabase() || db;
    
    // Prepare statements for better performance
    this.createStmt = database.prepare(`
      INSERT INTO moderation_actions (review_id, moderator_id, action, notes)
      VALUES (?, ?, ?, ?)
    `);

    this.getByReviewStmt = database.prepare(`
      SELECT * FROM moderation_actions 
      WHERE review_id = ?
      ORDER BY created_at DESC
    `);

    this.getByModeratorStmt = database.prepare(`
      SELECT * FROM moderation_actions 
      WHERE moderator_id = ?
      ORDER BY created_at DESC
    `);

    this.getStatisticsStmt = database.prepare(`
      SELECT 
        action,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM moderation_actions 
      WHERE created_at BETWEEN ? AND ?
      GROUP BY action, DATE(created_at)
      ORDER BY created_at DESC
    `);

    this.getStatisticsAllTimeStmt = database.prepare(`
      SELECT 
        action,
        COUNT(*) as count
      FROM moderation_actions 
      GROUP BY action
    `);

    this.getApprovalRateStmt = database.prepare(`
      SELECT 
        SUM(CASE WHEN action = 'approve' THEN 1 ELSE 0 END) as approved,
        COUNT(*) as total
      FROM moderation_actions 
      WHERE action IN ('approve', 'reject')
      AND created_at BETWEEN ? AND ?
    `);

    this.getApprovalRateAllTimeStmt = database.prepare(`
      SELECT 
        SUM(CASE WHEN action = 'approve' THEN 1 ELSE 0 END) as approved,
        COUNT(*) as total
      FROM moderation_actions 
      WHERE action IN ('approve', 'reject')
    `);

    this.getAverageProcessingTimeStmt = database.prepare(`
      SELECT 
        AVG(
          (julianday(ma.created_at) - julianday(r.created_at)) * 24 * 60
        ) as avg_minutes
      FROM moderation_actions ma
      JOIN reviews r ON ma.review_id = r.id
      WHERE ma.action IN ('approve', 'reject')
      AND ma.created_at BETWEEN ? AND ?
    `);

    this.getAverageProcessingTimeAllTimeStmt = database.prepare(`
      SELECT 
        AVG(
          (julianday(ma.created_at) - julianday(r.created_at)) * 24 * 60
        ) as avg_minutes
      FROM moderation_actions ma
      JOIN reviews r ON ma.review_id = r.id
      WHERE ma.action IN ('approve', 'reject')
    `);
  }

  /**
   * Create a new moderation action to log moderator activity
   * @param {number} reviewId - Review ID
   * @param {number} moderatorId - Moderator ID
   * @param {string} action - Action taken ('approve', 'reject', 'flag')
   * @param {string} notes - Optional notes explaining the action
   * @returns {ModerationAction} The created moderation action
   * @throws {Error} If creation fails
   */
  create(reviewId, moderatorId, action, notes = '') {
    try {
      // Validate input
      const moderationAction = new ModerationAction({ reviewId, moderatorId, action, notes });
      const validation = moderationAction.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Insert moderation action using prepared statement
      const result = this.createStmt.run(reviewId, moderatorId, action, notes);
      
      // Return the created moderation action with the new ID
      return new ModerationAction({
        id: result.lastInsertRowid,
        reviewId,
        moderatorId,
        action,
        notes,
        createdAt: new Date()
      });
    } catch (error) {
      throw new Error(`Failed to create moderation action: ${error.message}`);
    }
  }

  /**
   * Retrieve action history for a specific review
   * @param {number} reviewId - The review ID
   * @returns {ModerationAction[]} Array of moderation actions for the review
   */
  getByReview(reviewId) {
    try {
      const rows = this.getByReviewStmt.all(reviewId);
      return rows.map(row => ModerationAction.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to retrieve moderation actions by review: ${error.message}`);
    }
  }

  /**
   * Retrieve actions performed by a specific moderator
   * @param {number} moderatorId - The moderator ID
   * @returns {ModerationAction[]} Array of moderation actions by the moderator
   */
  getByModerator(moderatorId) {
    try {
      const rows = this.getByModeratorStmt.all(moderatorId);
      return rows.map(row => ModerationAction.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to retrieve moderation actions by moderator: ${error.message}`);
    }
  }

  /**
   * Get moderation statistics with date range filtering and SQL aggregations
   * @param {Date} startDate - Optional start date for filtering
   * @param {Date} endDate - Optional end date for filtering
   * @returns {Object} Statistics object with counts, approval rate, and average processing time
   */
  getStatistics(startDate = null, endDate = null) {
    try {
      let actionCounts = {};
      let approvalRate = 0;
      let averageProcessingTime = 0;

      if (startDate && endDate) {
        // Get action counts with date filtering
        const actionRows = this.getStatisticsStmt.all(
          startDate.toISOString(),
          endDate.toISOString()
        );
        
        // Aggregate action counts
        actionRows.forEach(row => {
          if (!actionCounts[row.action]) {
            actionCounts[row.action] = 0;
          }
          actionCounts[row.action] += row.count;
        });

        // Get approval rate with date filtering
        const approvalRow = this.getApprovalRateStmt.get(
          startDate.toISOString(),
          endDate.toISOString()
        );
        
        if (approvalRow && approvalRow.total > 0) {
          approvalRate = (approvalRow.approved / approvalRow.total) * 100;
        }

        // Get average processing time with date filtering
        const timeRow = this.getAverageProcessingTimeStmt.get(
          startDate.toISOString(),
          endDate.toISOString()
        );
        
        if (timeRow && timeRow.avg_minutes) {
          averageProcessingTime = parseFloat(timeRow.avg_minutes);
        }
      } else {
        // Get all-time statistics
        const actionRows = this.getStatisticsAllTimeStmt.all();
        
        actionRows.forEach(row => {
          actionCounts[row.action] = row.count;
        });

        // Get all-time approval rate
        const approvalRow = this.getApprovalRateAllTimeStmt.get();
        
        if (approvalRow && approvalRow.total > 0) {
          approvalRate = (approvalRow.approved / approvalRow.total) * 100;
        }

        // Get all-time average processing time
        const timeRow = this.getAverageProcessingTimeAllTimeStmt.get();
        
        if (timeRow && timeRow.avg_minutes) {
          averageProcessingTime = parseFloat(timeRow.avg_minutes);
        }
      }

      return {
        actionCounts: {
          approve: actionCounts.approve || 0,
          reject: actionCounts.reject || 0,
          flag: actionCounts.flag || 0
        },
        approvalRate: Math.round(approvalRate * 100) / 100, // Round to 2 decimal places
        averageProcessingTimeMinutes: Math.round(averageProcessingTime * 100) / 100, // Round to 2 decimal places
        totalActions: Object.values(actionCounts).reduce((sum, count) => sum + count, 0),
        dateRange: {
          startDate: startDate ? startDate.toISOString() : null,
          endDate: endDate ? endDate.toISOString() : null
        }
      };
    } catch (error) {
      throw new Error(`Failed to get moderation statistics: ${error.message}`);
    }
  }
}

export default ModerationActionRepository;