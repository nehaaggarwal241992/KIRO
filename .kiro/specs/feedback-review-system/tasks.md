# Implementation Plan

- [x] 1. Set up project structure and database foundation








  - Initialize Node.js backend project with Express.js and better-sqlite3
  - Create directory structure: src/models, src/repositories, src/services, src/routes, src/middleware
  - Initialize React frontend project with Vite
  - Create frontend directory structure: src/components, src/services, src/hooks, src/context
  - Set up SQLite database connection using better-sqlite3 with WAL mode
  - Implement database initialization script that creates all tables with proper schema
  - Configure CORS for backend to allow frontend requests
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Implement data models and validation (Backend - Node.js)





  - [x] 2.1 Create User model with role validation


    - Write User class in src/models/User.js with fields: id, username, email, role, createdAt
    - Implement role validation to ensure only 'user' or 'moderator' values
    - Add email format validation using regex
    - _Requirements: 8.1_
  
  - [x] 2.2 Create Product model


    - Write Product class in src/models/Product.js with fields: id, name, description, category, createdAt
    - Implement basic validation for required fields
    - _Requirements: 8.2_
  
  - [x] 2.3 Create Review model with rating validation


    - Write Review class in src/models/Review.js with fields: id, userId, productId, rating, reviewText, status, createdAt, updatedAt
    - Implement rating validation (1-5 range)
    - Implement status validation (pending, approved, rejected, flagged)
    - Add review text length validation (max 5000 characters)
    - _Requirements: 1.2, 1.3, 8.3_
  
  - [x] 2.4 Create ModerationAction model


    - Write ModerationAction class in src/models/ModerationAction.js with fields: id, reviewId, moderatorId, action, notes, createdAt
    - Implement action validation (approve, reject, flag)
    - _Requirements: 5.5, 8.4_

- [x] 3. Implement repository layer for data access (Backend - Node.js)





  - [x] 3.1 Create UserRepository with CRUD operations


    - Create src/repositories/UserRepository.js
    - Implement create() method using better-sqlite3 prepared statements
    - Implement getById() method to retrieve user by ID
    - Implement getByUsername() method to retrieve user by username
    - Implement isModerator() method to check user role
    - Use parameterized queries to prevent SQL injection
    - _Requirements: 8.1_
  
  - [x] 3.2 Create ProductRepository with CRUD operations


    - Create src/repositories/ProductRepository.js
    - Implement create() method using prepared statements
    - Implement getById() method to retrieve product by ID
    - Implement getAll() method to retrieve all products
    - _Requirements: 8.2_
  
  - [x] 3.3 Create ReviewRepository with comprehensive query methods


    - Create src/repositories/ReviewRepository.js
    - Implement create() method to insert reviews with pending status
    - Implement getById() method to retrieve review by ID
    - Implement getByProduct() method with status filtering
    - Implement getByUser() method to retrieve user's reviews
    - Implement getPending() method for moderation queue
    - Implement getFlagged() method for flagged reviews
    - Implement update() method for editing review content and rating
    - Implement updateStatus() method for status transitions
    - Implement delete() method for removing reviews
    - Implement getAverageRating() method with SQL AVG aggregation
    - Implement getReviewCount() method with status filtering
    - Add proper sorting by createdAt timestamp using ORDER BY
    - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.4, 3.1, 3.2, 3.3, 4.1, 4.3_
  
  - [x] 3.4 Create ModerationActionRepository for audit trail


    - Create src/repositories/ModerationActionRepository.js
    - Implement create() method to log moderation actions
    - Implement getByReview() method to retrieve action history for a review
    - Implement getByModerator() method to retrieve actions by moderator
    - Implement getStatistics() method with date range filtering and SQL aggregations
    - _Requirements: 5.5, 7.1, 7.2, 7.3, 7.4_

- [x] 4. Implement service layer business logic (Backend - Node.js)




  - [x] 4.1 Create ReviewService for review operations


    - Create src/services/ReviewService.js
    - Implement createReview() method that validates input and sets status to pending
    - Implement getReview() method that retrieves review by ID
    - Implement updateReview() method that checks ownership and resets status to pending
    - Implement deleteReview() method that checks ownership before deletion
    - Implement getProductReviews() method that returns only approved reviews sorted by date
    - Implement getUserReviews() method for user's own reviews
    - Implement getProductStatistics() method that calculates average rating and count
    - Add validation for rating range (1-5) and review text length
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.2 Create ModerationService for moderation workflows


    - Create src/services/ModerationService.js
    - Implement getPendingQueue() method that retrieves pending reviews ordered by oldest first
    - Implement getFlaggedReviews() method for flagged content
    - Implement approveReview() method that validates moderator role, updates status, and logs action
    - Implement rejectReview() method that validates moderator role, updates status, and logs action
    - Implement flagReview() method that validates moderator role, updates status, adds notes, and logs action
    - Implement getModerationHistory() method with filtering by date range and moderator
    - Implement getStatistics() method that calculates approval rate and average processing time
    - Add validation to prevent moderators from moderating their own reviews
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 4.3 Create UserService for user management


    - Create src/services/UserService.js
    - Implement createUser() method with validation
    - Implement getUser() method to retrieve user details
    - Implement verifyModerator() method to check moderator privileges
    - _Requirements: 4.5, 5.1_
  
  - [x] 4.4 Create ProductService for product management


    - Create src/services/ProductService.js
    - Implement createProduct() method with validation
    - Implement getProduct() method to retrieve product details
    - Implement getAllProducts() method with review statistics
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. Implement API endpoints for users (Backend - Express.js)





  - [x] 5.1 Create POST /api/reviews endpoint


    - Create src/routes/reviews.js with Express router
    - Implement route handler that accepts userId, productId, rating, reviewText from request body
    - Validate authentication and input parameters
    - Call ReviewService.createReview()
    - Return 201 Created with review data or 400 Bad Request on validation errors
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 5.2 Create GET /api/reviews/:id endpoint

    - Implement route handler that retrieves review by ID from params
    - Call ReviewService.getReview()
    - Return 200 OK with review data or 404 Not Found
    - _Requirements: 2.5_
  
  - [x] 5.3 Create PUT /api/reviews/:id endpoint

    - Implement route handler that accepts rating and reviewText updates from request body
    - Validate authentication and ownership
    - Call ReviewService.updateReview()
    - Return 200 OK with updated review or 403 Forbidden if not owner
    - _Requirements: 3.1, 3.2, 3.4, 3.5_
  
  - [x] 5.4 Create DELETE /api/reviews/:id endpoint

    - Implement route handler for review deletion
    - Validate authentication and ownership
    - Call ReviewService.deleteReview()
    - Return 204 No Content or 403 Forbidden if not owner
    - _Requirements: 3.3, 3.5_
  
  - [x] 5.5 Create GET /api/products/:id/reviews endpoint

    - Implement route handler that retrieves approved reviews for a product
    - Call ReviewService.getProductReviews()
    - Return 200 OK with review list sorted by date
    - _Requirements: 2.1, 2.4, 2.5_
  
  - [x] 5.6 Create GET /api/products/:id/rating endpoint

    - Implement route handler that calculates product statistics
    - Call ReviewService.getProductStatistics()
    - Return 200 OK with average rating and review count
    - _Requirements: 2.2, 2.3_

- [x] 6. Implement API endpoints for moderators (Backend - Express.js)





  - [x] 6.1 Create GET /api/moderation/queue endpoint


    - Create src/routes/moderation.js with Express router
    - Implement route handler that retrieves pending reviews
    - Validate moderator authentication using middleware
    - Call ModerationService.getPendingQueue()
    - Return 200 OK with pending reviews or 403 Forbidden if not moderator
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 6.2 Create GET /api/moderation/flagged endpoint


    - Implement route handler that retrieves flagged reviews
    - Validate moderator authentication
    - Call ModerationService.getFlaggedReviews()
    - Return 200 OK with flagged reviews or 403 Forbidden
    - _Requirements: 6.5_
  
  - [x] 6.3 Create POST /api/moderation/approve/:id endpoint


    - Implement route handler for review approval
    - Validate moderator authentication
    - Call ModerationService.approveReview()
    - Return 200 OK with updated review or 403 Forbidden
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [x] 6.4 Create POST /api/moderation/reject/:id endpoint


    - Implement route handler for review rejection
    - Validate moderator authentication
    - Call ModerationService.rejectReview()
    - Return 200 OK with updated review or 403 Forbidden
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [x] 6.5 Create POST /api/moderation/flag/:id endpoint


    - Implement route handler for flagging reviews
    - Validate moderator authentication
    - Accept optional notes parameter from request body
    - Call ModerationService.flagReview()
    - Return 200 OK with updated review or 403 Forbidden
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 6.6 Create GET /api/moderation/history endpoint


    - Implement route handler that retrieves moderation action history
    - Validate moderator authentication
    - Accept optional date range and moderatorId filters from query params
    - Call ModerationService.getModerationHistory()
    - Return 200 OK with action history
    - _Requirements: 7.2, 7.5_
  
  - [x] 6.7 Create GET /api/moderation/statistics endpoint


    - Implement route handler that calculates moderation statistics
    - Validate moderator authentication
    - Call ModerationService.getStatistics()
    - Return 200 OK with statistics including counts, approval rate, and average time
    - _Requirements: 7.1, 7.3, 7.4_

- [x] 7. Implement error handling and middleware (Backend - Express.js)





  - [x] 7.1 Create global error handler middleware


    - Create src/middleware/errorHandler.js
    - Implement error handler middleware that catches all exceptions
    - Map exceptions to appropriate HTTP status codes
    - Return consistent error response format with code, message, and field
    - Log errors with context (userId, action, timestamp)
    - _Requirements: All requirements (error handling applies globally)_
  
  - [x] 7.2 Create authentication middleware


    - Create src/middleware/auth.js
    - Implement middleware that validates user authentication
    - Extract userId from request headers (e.g., x-user-id) or JWT token
    - Attach user object to req.user
    - Return 401 Unauthorized if authentication fails
    - _Requirements: 3.5, 4.5, 5.1_
  
  - [x] 7.3 Create authorization middleware for moderator routes


    - Create src/middleware/moderator.js
    - Implement middleware that checks moderator role from req.user
    - Use UserService.verifyModerator()
    - Return 403 Forbidden if user is not a moderator
    - _Requirements: 4.5, 5.1_

- [x] 8. Add database indexes and optimization (Backend - Node.js)





  - [x] 8.1 Verify and test database indexes


    - Confirm idx_reviews_product_status index exists and is used in queries
    - Confirm idx_reviews_user index exists and is used
    - Confirm idx_reviews_status index exists and is used
    - Confirm idx_moderation_review index exists and is used
    - Confirm idx_moderation_moderator index exists and is used
    - Use EXPLAIN QUERY PLAN to verify index usage
    - _Requirements: 8.5_
  
  - [x] 8.2 Optimize database connection handling


    - Configure better-sqlite3 with appropriate options (timeout, readonly)
    - Implement proper connection closing on application shutdown
    - Add error handling for database busy/locked scenarios
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 9. Implement React frontend components




  - [x] 9.1 Set up API service layer


    - Create src/services/api.js with Axios instance configured with base URL
    - Create src/services/reviewService.js with methods for all review API calls
    - Create src/services/moderationService.js with methods for all moderation API calls
    - Create src/services/productService.js with methods for product API calls
    - Add error handling and response interceptors
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 9.2 Create authentication context and hooks


    - Create src/context/AuthContext.jsx with user state and role management
    - Create src/hooks/useAuth.js hook for accessing auth context
    - Implement login/logout functionality (mock or simple implementation)
    - Store current user ID and role in context
    - _Requirements: 3.5, 4.5, 5.1_
  
  - [x] 9.3 Create review components for users


    - Create src/components/reviews/ReviewList.jsx to display reviews with sorting
    - Create src/components/reviews/ReviewCard.jsx to show individual review with rating
    - Create src/components/reviews/ReviewForm.jsx with controlled inputs for rating and text
    - Create src/components/reviews/RatingDisplay.jsx to show star ratings
    - Add edit and delete buttons for user's own reviews
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.4, 2.5, 3.1, 3.2, 3.3_
  
  - [x] 9.4 Create product components


    - Create src/components/products/ProductList.jsx to display all products
    - Create src/components/products/ProductDetail.jsx showing product info, average rating, and reviews
    - Integrate ReviewList component to show product reviews
    - Display review count and average rating prominently
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 9.5 Create moderation components for moderators


    - Create src/components/moderation/ModerationQueue.jsx to display pending reviews
    - Create src/components/moderation/ModerationCard.jsx with approve/reject/flag buttons
    - Create src/components/moderation/FlaggedReviews.jsx to show flagged content
    - Create src/components/moderation/ModerationStats.jsx dashboard with statistics
    - Add modal or form for adding notes when flagging reviews
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 9.6 Create routing and navigation


    - Create src/App.jsx with React Router setup
    - Implement routes for home, product detail, review forms, and moderation pages
    - Create src/components/common/Navbar.jsx with navigation links
    - Add conditional rendering for moderator-only routes
    - Create src/components/common/ErrorMessage.jsx for displaying errors
    - _Requirements: All requirements (navigation applies globally)_
  
  - [x] 9.7 Implement data fetching hooks


    - Create src/hooks/useReviews.js for fetching and managing review data
    - Implement loading and error states
    - Add automatic refetching after create/update/delete operations
    - Use React Query or custom hooks with useEffect
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

- [x] 10. Create integration tests for API endpoints






  - [x]* 10.1 Write tests for user review endpoints


    - Test POST /api/reviews with valid and invalid data
    - Test GET /api/reviews/:id for existing and non-existing reviews
    - Test PUT /api/reviews/:id with ownership validation
    - Test DELETE /api/reviews/:id with ownership validation
    - Test GET /api/products/:id/reviews with multiple reviews
    - Test GET /api/products/:id/rating calculation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x]* 10.2 Write tests for moderator endpoints


    - Test GET /api/moderation/queue with pending reviews
    - Test GET /api/moderation/flagged with flagged reviews
    - Test POST /api/moderation/approve/:id with status changes
    - Test POST /api/moderation/reject/:id with status changes
    - Test POST /api/moderation/flag/:id with notes
    - Test GET /api/moderation/history with filtering
    - Test GET /api/moderation/statistics calculations
    - Test authorization for non-moderator users
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x]* 10.3 Write tests for error handling


    - Test validation errors return 400 Bad Request
    - Test authorization errors return 403 Forbidden
    - Test not found errors return 404 Not Found
    - Test database errors return 500 Internal Server Error
    - Verify error response format consistency
    - _Requirements: All requirements (error handling applies globally)_

- [x]* 11. Create seed data and demo script



  - Create seed script that populates database with sample users (regular and moderators)
  - Add sample products across different categories
  - Add sample reviews in various states (pending, approved, rejected, flagged)
  - Add sample moderation actions for audit trail
  - Create demo script that showcases key workflows
  - _Requirements: All requirements (for demonstration purposes)_
