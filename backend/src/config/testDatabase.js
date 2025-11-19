// Test database configuration that can be used in tests
import Database from 'better-sqlite3';

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