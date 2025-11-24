// Test database configuration that can be used in tests
// In production, this module does nothing (no SQLite import)

let testDb = null;

export function setTestDatabase(db) {
  testDb = db;
}

export function getTestDatabase() {
  return testDb;
}

export function clearTestDatabase() {
  testDb = null;
}

// Note: better-sqlite3 is only imported in test files, not here
// This allows production builds to work without SQLite