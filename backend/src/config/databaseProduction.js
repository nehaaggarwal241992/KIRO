// Production database loader - ONLY uses PostgreSQL
// This file is used in production to avoid any SQLite imports

import pg from 'pg';
const { Pool } = pg;

// Validate DATABASE_URL is present
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required in production');
}

console.log('Initializing PostgreSQL connection for production...');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('connect', () => {
  console.log('PostgreSQL client connected');
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
});

// Create a wrapper that mimics the SQLite interface for compatibility
const db = {
  // Execute a query (for CREATE TABLE, etc.)
  exec: async (sql) => {
    const client = await pool.connect();
    try {
      await client.query(sql);
    } finally {
      client.release();
    }
  },

  // Prepare a statement (returns an object with run, get, all methods)
  prepare: (sql) => {
    return {
      run: async (...params) => {
        const client = await pool.connect();
        try {
          const result = await client.query(sql, params);
          return { changes: result.rowCount, lastInsertRowid: result.rows[0]?.id };
        } finally {
          client.release();
        }
      },
      get: async (...params) => {
        const client = await pool.connect();
        try {
          const result = await client.query(sql, params);
          return result.rows[0];
        } finally {
          client.release();
        }
      },
      all: async (...params) => {
        const client = await pool.connect();
        try {
          const result = await client.query(sql, params);
          return result.rows;
        } finally {
          client.release();
        }
      },
    };
  },

  // Health check
  healthCheck: async () => {
    try {
      const result = await pool.query('SELECT 1 as health');
      return result.rows[0].health === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  },

  // Get database info
  getInfo: () => {
    return {
      type: 'PostgreSQL',
      poolSize: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount,
    };
  },

  // Close connection
  close: async () => {
    console.log('Closing PostgreSQL connection pool...');
    await pool.end();
    console.log('PostgreSQL connection pool closed');
  },

  // Direct pool access for advanced queries
  pool,
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connections...');
  await db.close();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connections...');
  await db.close();
});

export default db;
