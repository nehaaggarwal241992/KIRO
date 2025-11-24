import db from '../config/databaseLoader.js';
import { getTestDatabase } from '../config/testDatabase.js';
import User from '../models/User.js';

class UserRepository {
  constructor() {
    // Use test database if available, otherwise use regular database
    const database = getTestDatabase() || db;
    
    // Prepare statements for better performance
    this.createStmt = database.prepare(`
      INSERT INTO users (username, email, role)
      VALUES (?, ?, ?)
    `);

    this.getByIdStmt = database.prepare(`
      SELECT * FROM users WHERE id = ?
    `);

    this.getByUsernameStmt = database.prepare(`
      SELECT * FROM users WHERE username = ?
    `);

    this.isModeratorStmt = database.prepare(`
      SELECT role FROM users WHERE id = ?
    `);
  }

  /**
   * Create a new user
   * @param {string} username - User's username
   * @param {string} email - User's email
   * @param {string} role - User's role ('user' or 'moderator')
   * @returns {User} The created user
   * @throws {Error} If user creation fails
   */
  create(username, email, role = 'user') {
    try {
      // Validate input
      const user = new User({ username, email, role });
      const validation = user.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Insert user using prepared statement
      const result = this.createStmt.run(username, email, role);
      
      // Return the created user with the new ID
      return new User({
        id: result.lastInsertRowid,
        username,
        email,
        role,
        createdAt: new Date()
      });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  /**
   * Retrieve user by ID
   * @param {number} userId - The user ID
   * @returns {User|null} The user or null if not found
   */
  getById(userId) {
    try {
      const row = this.getByIdStmt.get(userId);
      return row ? User.fromRow(row) : null;
    } catch (error) {
      throw new Error(`Failed to retrieve user by ID: ${error.message}`);
    }
  }

  /**
   * Retrieve user by username
   * @param {string} username - The username
   * @returns {User|null} The user or null if not found
   */
  getByUsername(username) {
    try {
      const row = this.getByUsernameStmt.get(username);
      return row ? User.fromRow(row) : null;
    } catch (error) {
      throw new Error(`Failed to retrieve user by username: ${error.message}`);
    }
  }

  /**
   * Check if user is a moderator
   * @param {number} userId - The user ID
   * @returns {boolean} True if user is a moderator, false otherwise
   */
  isModerator(userId) {
    try {
      const row = this.isModeratorStmt.get(userId);
      return row ? row.role === 'moderator' : false;
    } catch (error) {
      throw new Error(`Failed to check moderator status: ${error.message}`);
    }
  }
}

export default UserRepository;