import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = join(__dirname, '../../data/reviews.db');

// Database connection options
const dbOptions = {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null,
  fileMustExist: false,
  timeout: 10000, // 10 second timeout for database operations
  readonly: false
};

// Create database connection with optimized settings
const db = new Database(dbPath, dbOptions);

// Configure database for optimal performance and concurrency
try {
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  
  // Set synchronous mode to NORMAL for better performance while maintaining safety
  db.pragma('synchronous = NORMAL');
  
  // Increase cache size for better performance (1000 pages = ~4MB with 4KB page size)
  db.pragma('cache_size = 1000');
  
  // Store temporary tables and indices in memory
  db.pragma('temp_store = memory');
  
  // Set busy timeout to handle concurrent access
  db.pragma('busy_timeout = 30000'); // 30 seconds
  
  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');
  
  // Optimize for faster writes
  db.pragma('wal_autocheckpoint = 1000');
  
  console.log('Database connection established with optimized settings');
} catch (error) {
  console.error('Failed to configure database:', error);
  throw error;
}

// Database connection state tracking
let isClosing = false;

// Enhanced error handling for database operations
function handleDatabaseError(error, operation) {
  console.error(`Database error during ${operation}:`, error);
  
  if (error.code === 'SQLITE_BUSY') {
    console.warn('Database is busy, operation may need to be retried');
    throw new Error(`Database busy during ${operation}. Please try again.`);
  } else if (error.code === 'SQLITE_LOCKED') {
    console.warn('Database is locked, operation failed');
    throw new Error(`Database locked during ${operation}. Please try again.`);
  } else if (error.code === 'SQLITE_CORRUPT') {
    console.error('Database corruption detected!');
    throw new Error('Database corruption detected. Please contact support.');
  }
  
  throw error;
}

// Wrapper function for database operations with error handling
function executeWithErrorHandling(operation, operationName) {
  try {
    return operation();
  } catch (error) {
    handleDatabaseError(error, operationName);
  }
}

// Enhanced database object with error handling
const enhancedDb = {
  // Proxy all database methods through error handling
  ...db,
  
  // Override prepare method with error handling
  prepare(sql) {
    return executeWithErrorHandling(() => {
      const stmt = db.prepare(sql);
      
      // Wrap statement methods with error handling
      const originalRun = stmt.run.bind(stmt);
      const originalGet = stmt.get.bind(stmt);
      const originalAll = stmt.all.bind(stmt);
      
      stmt.run = (...args) => executeWithErrorHandling(() => originalRun(...args), 'statement run');
      stmt.get = (...args) => executeWithErrorHandling(() => originalGet(...args), 'statement get');
      stmt.all = (...args) => executeWithErrorHandling(() => originalAll(...args), 'statement all');
      
      return stmt;
    }, 'prepare statement');
  },
  
  // Override exec method with error handling
  exec(sql) {
    return executeWithErrorHandling(() => db.exec(sql), 'exec');
  },
  
  // Override pragma method with error handling
  pragma(sql) {
    return executeWithErrorHandling(() => db.pragma(sql), 'pragma');
  },
  
  // Add transaction wrapper with error handling
  transaction(fn) {
    return executeWithErrorHandling(() => db.transaction(fn), 'transaction');
  },
  
  // Enhanced close method
  close() {
    if (isClosing) {
      console.log('Database close already in progress');
      return;
    }
    
    isClosing = true;
    console.log('Closing database connection...');
    
    try {
      // Checkpoint WAL file before closing
      db.pragma('wal_checkpoint(TRUNCATE)');
      db.close();
      console.log('Database connection closed successfully');
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  },
  
  // Health check method
  healthCheck() {
    try {
      const result = db.prepare('SELECT 1 as health').get();
      return result.health === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  },
  
  // Get database info
  getInfo() {
    try {
      return {
        journalMode: db.pragma('journal_mode', { simple: true }),
        synchronous: db.pragma('synchronous', { simple: true }),
        cacheSize: db.pragma('cache_size', { simple: true }),
        tempStore: db.pragma('temp_store', { simple: true }),
        busyTimeout: db.pragma('busy_timeout', { simple: true }),
        foreignKeys: db.pragma('foreign_keys', { simple: true }),
        walAutocheckpoint: db.pragma('wal_autocheckpoint', { simple: true })
      };
    } catch (error) {
      console.error('Failed to get database info:', error);
      return null;
    }
  }
};

// Graceful shutdown handling
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    
    try {
      enhancedDb.close();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };
  
  // Handle various shutdown signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    try {
      enhancedDb.close();
    } catch (closeError) {
      console.error('Error closing database during exception handling:', closeError);
    }
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    try {
      enhancedDb.close();
    } catch (closeError) {
      console.error('Error closing database during rejection handling:', closeError);
    }
    process.exit(1);
  });
}

// Set up graceful shutdown
setupGracefulShutdown();

export default enhancedDb;