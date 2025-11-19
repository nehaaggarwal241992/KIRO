# Design Document: Feedback and Review System

## Overview

The Feedback and Review System is a lightweight application that enables users to submit product/service reviews with ratings, while providing moderators with tools to ensure content quality. The system uses SQLite as its database, making it portable and easy to deploy without external database dependencies.

The architecture follows a layered approach with clear separation between data access, business logic, and presentation layers. The system supports role-based access control (User vs Moderator) and maintains a complete audit trail of moderation activities.

## Architecture

### System Layers

```
┌─────────────────────────────────────┐
│     Presentation Layer (API)        │
│  - REST endpoints for users         │
│  - REST endpoints for moderators    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Business Logic Layer          │
│  - Review Service                   │
│  - Moderation Service               │
│  - User Service                     │
│  - Product Service                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Data Access Layer (DAL)        │
│  - Repository Pattern               │
│  - Database Connection Manager      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         SQLite Database             │
└─────────────────────────────────────┘
```

### Technology Stack

- **Database**: SQLite 3.x
- **Backend Language**: Node.js (v18+)
- **Backend Framework**: Express.js
- **Database Library**: better-sqlite3
- **Frontend Framework**: React (v18+)
- **Frontend Build Tool**: Vite
- **HTTP Client**: Axios (for API calls from React)

## Components and Interfaces

### 0. Frontend Architecture (React)

The React frontend will be organized into the following structure:

```
src/
├── components/
│   ├── reviews/
│   │   ├── ReviewList.jsx          // Display list of reviews
│   │   ├── ReviewCard.jsx          // Individual review display
│   │   ├── ReviewForm.jsx          // Create/edit review form
│   │   └── RatingDisplay.jsx       // Star rating component
│   ├── moderation/
│   │   ├── ModerationQueue.jsx     // Pending reviews queue
│   │   ├── ModerationCard.jsx      // Review with moderation actions
│   │   ├── FlaggedReviews.jsx      // Flagged reviews list
│   │   └── ModerationStats.jsx     // Statistics dashboard
│   ├── products/
│   │   ├── ProductList.jsx         // Product catalog
│   │   └── ProductDetail.jsx       // Product with reviews
│   └── common/
│       ├── Navbar.jsx              // Navigation bar
│       └── ErrorMessage.jsx        // Error display component
├── services/
│   ├── api.js                      // Axios instance configuration
│   ├── reviewService.js            // Review API calls
│   ├── moderationService.js        // Moderation API calls
│   └── productService.js           // Product API calls
├── hooks/
│   ├── useAuth.js                  // Authentication hook
│   └── useReviews.js               // Reviews data fetching hook
├── context/
│   └── AuthContext.jsx             // User authentication context
├── App.jsx                         // Main app component with routing
└── main.jsx                        // Entry point
```

**Key React Components:**

- **ReviewList**: Fetches and displays reviews for a product, handles pagination
- **ReviewForm**: Controlled form for creating/editing reviews with rating input
- **ModerationQueue**: Displays pending reviews with approve/reject/flag buttons
- **ProductDetail**: Shows product info, average rating, and review list
- **ModerationStats**: Dashboard showing moderation metrics and charts

**State Management:**
- Use React Context for authentication state (current user, role)
- Use React hooks (useState, useEffect) for component-level state
- Custom hooks for data fetching and API interactions

**Routing:**
- `/` - Home page with product list
- `/products/:id` - Product detail with reviews
- `/reviews/new/:productId` - Create review form
- `/reviews/edit/:id` - Edit review form
- `/moderation/queue` - Moderation queue (moderators only)
- `/moderation/flagged` - Flagged reviews (moderators only)
- `/moderation/stats` - Statistics dashboard (moderators only)

### 1. Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('user', 'moderator')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected', 'flagged')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_product_status ON reviews(product_id, status);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
```

#### Moderation Actions Table
```sql
CREATE TABLE moderation_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    moderator_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('approve', 'reject', 'flag')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_moderation_review ON moderation_actions(review_id);
CREATE INDEX idx_moderation_moderator ON moderation_actions(moderator_id);
```

### 2. Repository Layer

#### ReviewRepository
```javascript
class ReviewRepository {
    create(userId, productId, rating, reviewText) // Returns Review
    getById(reviewId) // Returns Review
    getByProduct(productId, status = 'approved') // Returns Review[]
    getByUser(userId) // Returns Review[]
    getPending() // Returns Review[]
    getFlagged() // Returns Review[]
    update(reviewId, rating, reviewText) // Returns Review
    updateStatus(reviewId, status) // Returns Review
    delete(reviewId) // Returns boolean
    getAverageRating(productId) // Returns number
    getReviewCount(productId, status = 'approved') // Returns number
}
```

#### ModerationActionRepository
```javascript
class ModerationActionRepository {
    create(reviewId, moderatorId, action, notes) // Returns ModerationAction
    getByReview(reviewId) // Returns ModerationAction[]
    getByModerator(moderatorId) // Returns ModerationAction[]
    getStatistics(startDate, endDate) // Returns Object
}
```

#### UserRepository
```javascript
class UserRepository {
    create(username, email, role) // Returns User
    getById(userId) // Returns User
    getByUsername(username) // Returns User
    isModerator(userId) // Returns boolean
}
```

#### ProductRepository
```javascript
class ProductRepository {
    create(name, description, category) // Returns Product
    getById(productId) // Returns Product
    getAll() // Returns Product[]
}
```

### 3. Service Layer

#### ReviewService
Handles business logic for review operations:
- Validates review content and ratings
- Enforces ownership rules (users can only edit their own reviews)
- Automatically sets status to 'pending' for new/edited reviews
- Calculates aggregate statistics (average rating, count)

#### ModerationService
Handles moderation workflows:
- Validates moderator permissions
- Processes approve/reject/flag actions
- Records moderation history
- Generates moderation statistics and reports

#### UserService
Manages user operations:
- User authentication and authorization
- Role verification

#### ProductService
Manages product catalog:
- Product CRUD operations
- Product listing with review statistics

### 4. API Layer

#### User Endpoints
```
POST   /api/reviews                    - Create a new review
GET    /api/reviews/:id                - Get a specific review
PUT    /api/reviews/:id                - Update own review
DELETE /api/reviews/:id                - Delete own review
GET    /api/products/:id/reviews       - Get all approved reviews for a product
GET    /api/products/:id/rating        - Get average rating for a product
```

#### Moderator Endpoints
```
GET    /api/moderation/queue           - Get pending reviews
GET    /api/moderation/flagged         - Get flagged reviews
POST   /api/moderation/approve/:id     - Approve a review
POST   /api/moderation/reject/:id      - Reject a review
POST   /api/moderation/flag/:id        - Flag a review
GET    /api/moderation/history         - Get moderation history
GET    /api/moderation/statistics      - Get moderation statistics
```

## Data Models

### Review Model
```javascript
class Review {
    id: number
    userId: number
    productId: number
    rating: number  // 1-5
    reviewText: string
    status: string  // 'pending', 'approved', 'rejected', 'flagged'
    createdAt: Date
    updatedAt: Date
    
    // Relationships (populated via joins)
    user?: User
    product?: Product
    moderationActions?: ModerationAction[]
}
```

### ModerationAction Model
```javascript
class ModerationAction {
    id: number
    reviewId: number
    moderatorId: number
    action: string  // 'approve', 'reject', 'flag'
    notes: string
    createdAt: Date
    
    // Relationships (populated via joins)
    review?: Review
    moderator?: User
}
```

### User Model
```javascript
class User {
    id: number
    username: string
    email: string
    role: string  // 'user', 'moderator'
    createdAt: Date
}
```

### Product Model
```javascript
class Product {
    id: number
    name: string
    description: string
    category: string
    createdAt: Date
}
```

## Error Handling

### Error Categories

1. **Validation Errors** (400 Bad Request)
   - Invalid rating (not between 1-5)
   - Empty review text
   - Invalid status transitions

2. **Authorization Errors** (403 Forbidden)
   - User attempting to edit another user's review
   - Non-moderator accessing moderation endpoints
   - User attempting to approve their own review

3. **Not Found Errors** (404 Not Found)
   - Review ID does not exist
   - Product ID does not exist
   - User ID does not exist

4. **Database Errors** (500 Internal Server Error)
   - SQLite connection failures
   - Constraint violations
   - Transaction failures

### Error Response Format
```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Rating must be between 1 and 5",
        "field": "rating"
    }
}
```

### Error Handling Strategy

- Use try-catch blocks at the service layer
- Log all errors with context (user_id, action, timestamp)
- Return appropriate HTTP status codes
- Provide clear, actionable error messages
- Rollback database transactions on failures
- Implement connection pooling and retry logic for SQLite locks

## Testing Strategy

### Unit Tests

1. **Repository Layer Tests**
   - Test CRUD operations for each repository
   - Test query filters and sorting
   - Test foreign key constraints
   - Use in-memory SQLite database (`:memory:`)

2. **Service Layer Tests**
   - Test business logic validation
   - Test permission checks
   - Test status transitions
   - Mock repository dependencies

3. **Model Tests**
   - Test data validation
   - Test model relationships
   - Test serialization/deserialization

### Integration Tests

1. **API Endpoint Tests**
   - Test complete request/response cycles
   - Test authentication and authorization
   - Test error responses
   - Use test database file

2. **Database Tests**
   - Test schema migrations
   - Test index performance
   - Test concurrent access scenarios
   - Test transaction rollbacks

### Test Data Strategy

- Create fixtures for users (regular users and moderators)
- Create fixtures for products
- Create fixtures for reviews in various states
- Use factory pattern for test data generation
- Clean up test database after each test suite

### Performance Testing

- Test review listing with large datasets (1000+ reviews)
- Test concurrent moderation actions
- Test average rating calculation performance
- Monitor SQLite file size growth
- Test query performance with indexes

## Security Considerations

1. **Input Validation**
   - Sanitize all user inputs to prevent SQL injection
   - Use parameterized queries exclusively
   - Validate rating range (1-5)
   - Limit review text length (e.g., 5000 characters)

2. **Authorization**
   - Verify user identity for all operations
   - Check moderator role before allowing moderation actions
   - Prevent users from moderating their own reviews
   - Implement rate limiting on review submissions

3. **Data Privacy**
   - Don't expose user email addresses in public APIs
   - Log moderation actions for audit trail
   - Implement soft deletes for compliance (optional)

4. **Database Security**
   - Set appropriate file permissions on SQLite database file
   - Use WAL (Write-Ahead Logging) mode for better concurrency
   - Implement regular database backups
   - Consider encryption at rest for sensitive deployments
