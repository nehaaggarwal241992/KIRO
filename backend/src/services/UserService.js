import UserRepository from '../repositories/UserRepository.js';

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Create a new user with validation
   * @param {string} username - User's username
   * @param {string} email - User's email address
   * @param {string} role - User's role ('user' or 'moderator')
   * @returns {Object} Created user object
   * @throws {Error} If validation fails or creation fails
   */
  async createUser(username, email, role = 'user') {
    try {
      // Validate input parameters
      this._validateUserInput(username, email, role);

      // Create user through repository
      const user = this.userRepository.create(username, email, role);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Retrieve user details by ID
   * @param {number} userId - User ID
   * @returns {Object|null} User object or null if not found
   */
  async getUser(userId) {
    try {
      const user = this.userRepository.getById(userId);
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw new Error(`Failed to retrieve user: ${error.message}`);
    }
  }

  /**
   * Verify if a user has moderator privileges
   * @param {number} userId - User ID to check
   * @returns {boolean} True if user is a moderator, false otherwise
   * @throws {Error} If user is not found
   */
  async verifyModerator(userId) {
    try {
      // First check if user exists
      const user = this.userRepository.getById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check moderator status
      return this.userRepository.isModerator(userId);
    } catch (error) {
      throw new Error(`Failed to verify moderator status: ${error.message}`);
    }
  }

  /**
   * Get user by username (useful for authentication)
   * @param {string} username - Username to search for
   * @returns {Object|null} User object or null if not found
   */
  async getUserByUsername(username) {
    try {
      if (!username || typeof username !== 'string') {
        throw new Error('Username is required and must be a string');
      }

      const user = this.userRepository.getByUsername(username);
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw new Error(`Failed to retrieve user by username: ${error.message}`);
    }
  }

  /**
   * Validate user input parameters
   * @param {string} username - Username to validate
   * @param {string} email - Email to validate
   * @param {string} role - Role to validate
   * @throws {Error} If validation fails
   * @private
   */
  _validateUserInput(username, email, role) {
    // Validate username
    if (!username || typeof username !== 'string') {
      throw new Error('Username is required and must be a string');
    }

    if (username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }

    if (username.length < 3 || username.length > 50) {
      throw new Error('Username must be between 3 and 50 characters');
    }

    // Basic username format validation (alphanumeric and underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    if (email.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (email.length > 255) {
      throw new Error('Email cannot exceed 255 characters');
    }

    // Validate role
    if (!role || typeof role !== 'string') {
      throw new Error('Role is required and must be a string');
    }

    const validRoles = ['user', 'moderator'];
    if (!validRoles.includes(role)) {
      throw new Error('Role must be either "user" or "moderator"');
    }
  }
}

export default UserService;