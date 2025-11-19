class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.email = data.email || '';
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Validates the user data
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // Username validation
    if (!this.username || this.username.trim().length === 0) {
      errors.push('Username is required');
    }

    // Email validation
    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Email format is invalid');
    }

    // Role validation
    if (!this.isValidRole(this.role)) {
      errors.push('Role must be either "user" or "moderator"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates email format using regex
   * @param {string} email 
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates role to ensure only 'user' or 'moderator' values
   * @param {string} role 
   * @returns {boolean}
   */
  isValidRole(role) {
    const validRoles = ['user', 'moderator'];
    return validRoles.includes(role);
  }

  /**
   * Returns a plain object representation of the user
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt
    };
  }

  /**
   * Creates a User instance from database row data
   * @param {Object} row - Database row data
   * @returns {User}
   */
  static fromRow(row) {
    return new User({
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      createdAt: new Date(row.created_at)
    });
  }
}

export default User;