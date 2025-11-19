# Integration Tests

This directory contains integration tests for the Feedback and Review System API endpoints.

## Test Structure

- `integration/reviews.test.js` - Tests for user review endpoints
- `integration/moderation.test.js` - Tests for moderator endpoints  
- `integration/errorHandling.test.js` - Tests for error handling scenarios
- `helpers/testDatabase.js` - Test database setup utilities

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest tests/integration/reviews.test.js --run

# Run with coverage
npx vitest --coverage
```

## Test Database

Tests use an in-memory SQLite database that is created fresh for each test suite. The database is automatically seeded with test data including:

- Test users (regular users and moderators)
- Test products
- Test reviews in various states (pending, approved, rejected, flagged)
- Test moderation actions

## Test Coverage

The integration tests cover:

### User Review Endpoints
- POST /api/reviews - Create review with validation
- GET /api/reviews/:id - Retrieve review by ID
- PUT /api/reviews/:id - Update own review with ownership validation
- DELETE /api/reviews/:id - Delete own review with ownership validation
- GET /api/products/:id/reviews - Get approved reviews for product
- GET /api/products/:id/rating - Get product rating statistics

### Moderator Endpoints
- GET /api/moderation/queue - Get pending reviews
- GET /api/moderation/flagged - Get flagged reviews
- POST /api/moderation/approve/:id - Approve review
- POST /api/moderation/reject/:id - Reject review
- POST /api/moderation/flag/:id - Flag review
- GET /api/moderation/history - Get moderation history with filtering
- GET /api/moderation/statistics - Get moderation statistics

### Error Handling
- 400 Bad Request - Validation errors
- 401 Unauthorized - Authentication errors
- 403 Forbidden - Authorization errors
- 404 Not Found - Resource not found errors
- 500 Internal Server Error - Database errors
- Error response format consistency

## Test Data

Each test suite sets up its own isolated test data:

### Users
- ID 1: testuser1 (regular user)
- ID 2: testuser2 (regular user)  
- ID 3: moderator1 (moderator)

### Products
- ID 1: Test Product 1
- ID 2: Test Product 2

### Reviews
- ID 1: User 1 review for Product 1 (approved)
- ID 2: User 2 review for Product 1 (approved)
- ID 3: User 1 review for Product 2 (pending)
- ID 4: User 2 review for Product 2 (flagged)

## Authentication

Tests use a simple header-based authentication system:
- `x-user-id` header contains the user ID
- No actual JWT or session management in tests
- Authorization is tested by checking user roles and ownership

## Notes

- Tests are designed to be fast and isolated
- Each test suite creates its own database instance
- Database is cleaned up after each test
- Tests focus on API behavior rather than implementation details
- Error scenarios are thoroughly tested to ensure proper error handling