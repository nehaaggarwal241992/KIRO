// Smart database loader - uses PostgreSQL in production, SQLite in development
// This prevents SQLite from being loaded in production environments

// Determine which database to use based on environment
const usePostgres = process.env.DATABASE_URL || process.env.NODE_ENV === 'production';

let db;

if (usePostgres) {
  console.log('🚀 Loading PostgreSQL database configuration (Production)...');
  // Use production-specific loader that doesn't import SQLite at all
  const { default: postgresDb } = await import('./databaseProduction.js');
  db = postgresDb;
} else {
  console.log('💻 Loading SQLite database configuration (Development)...');
  const { default: sqliteDb } = await import('./database.js');
  db = sqliteDb;
}

export default db;
