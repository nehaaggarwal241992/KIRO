import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = join(__dirname, '../../data/reviews.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err);
    throw err;
  }
  console.log('Database connection established');
});

// Promisify database methods for easier async/await usage
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

// Configure database
db.serialize(() => {
  // Enable foreign key constraints
  db.run('PRAGMA foreign_keys = ON');
  
  // Set synchronous mode to NORMAL for better performance while maintaining safety
  db.run('PRAGMA synchronous = NORMAL');
  
  // Increase cache size for better performance
  db.run('PRAGMA cache_size = 1000');
  
  // Store temporary tables and indices in memory
  db.run('PRAGMA temp_store = memory');
  
  // Set busy timeout to handle concurrent access
  db.run('PRAGMA busy_timeout = 30000');
  
  console.log('Database configured with optimized settings');
});

// Enhanced database wrapper with error handling
const enhancedDb = {
  // Async methods
  async run(sql, params = []) {
    try {
      return await db.runAsync(sql, params);
    } catch (error) {
      console.error(`Database error during run: ${error.message}`);
      throw error;
    }
  },

  async get(sql, params = []) {
    try {
      return await db.getAsync(sql, params);
    } catch (error) {
      console.error(`Database error during get: ${error.message}`);
      throw error;
    }
  },

  async all(sql, params = []) {
    try {
      return await db.allAsync(sql, params);
    } catch (error) {
      console.error(`Database error during all: ${error.message}`);
      throw error;
    }
  },

  // Prepared statement wrapper
  prepare(sql) {
    const stmt = db.prepare(sql);
    
    return {
      run: async (...params) => {
        try {
          return await promisify(stmt.run.bind(stmt))(...params);
        } catch (error) {
          console.error(`Database error during prepared run: ${error.message}`);
          throw error;
        }
      },
      
      get: async (...params) => {
        try {
          return await promisify(stmt.get.bind(stmt))(...params);
        } catch (error) {
          console.error(`Database error during prepared get: ${error.message}`);
          throw error;
        }
      },
      
      all: async (...params) => {
        try {
          return await promisify(stmt.all.bind(stmt))(...params);
        } catch (error) {
          console.error(`Database error during prepared all: ${error.message}`);
          throw error;
        }
      },
      
      finalize: () => {
        stmt.finalize();
      }
    };
  },

  // Execute multiple statements
  async exec(sql) {
    try {
      return await promisify(db.exec.bind(db))(sql);
    } catch (error) {
      console.error(`Database error during exec: ${error.message}`);
      throw error;
    }
  },

  // Transaction wrapper
  async transaction(fn) {
    try {
      await this.run('BEGIN TRANSACTION');
      const result = await fn();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  },

  // Close database
  close() {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  },

  // Health check
  async healthCheck() {
    try {
      const result = await this.get('SELECT 1 as health');
      return result.health === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database...');
  try {
    await enhancedDb.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database...');
  try {
    await enhancedDb.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default enhancedDb;