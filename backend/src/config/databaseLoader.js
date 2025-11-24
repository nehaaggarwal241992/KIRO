// Smart database loader - uses PostgreSQL in production, SQLite in development
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine which database to use based on environment
const usePostgres = process.env.DATABASE_URL || process.env.NODE_ENV === 'production';

let db;

if (usePostgres) {
  console.log('Loading PostgreSQL database configuration...');
  const { default: postgresDb } = await import('./databasePostgres.js');
  db = postgresDb;
} else {
  console.log('Loading SQLite database configuration...');
  const { default: sqliteDb } = await import('./database.js');
  db = sqliteDb;
}

export default db;
