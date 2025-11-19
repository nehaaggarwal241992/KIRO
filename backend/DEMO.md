# Feedback and Review System Demo

This document provides instructions for running the demo and understanding the sample data structure.

## Quick Start

### Option 1: Complete Setup (Recommended)
```bash
# Run complete demo setup (database + seed + demo)
npm run setup-demo
```

### Option 2: Step by Step
```bash
# 1. Initialize database
npm run init-db

# 2. Seed sample data
npm run seed

# 3. Run interactive demo
npm run demo

# 4. Start the server
npm start
```

## Sample Data Overview

### Users (13 total)
- **Regular Users (10)**: alice_johnson, bob_smith, carol_davis, david_wilson, emma_brown, frank_miller, grace_taylor, henry_anderson, iris_thomas, jack_martinez
- **Moderators (3)**: mod_sarah, mod_mike, mod_lisa

### Products (20 total)
Distributed across 4 categories:
- **Electronics (5)**: Wireless Headphones, 4K Smart TV, Gaming Laptop, Smartphone, Wireless Charging Pad
- **Home & Garden (5)**: Robot Vacuum, Air Purifier, Smart Thermostat, LED Desk Lamp, Garden Tool Set
- **Books (5)**: Programming, Cooking, Mindfulness, History, Photography guides
- **Sports & Fitness (5)**: Yoga Mat, Resistance Bands, Running Shoes, Fitness Tracker, Dumbbells

### Reviews (150+ total)
- **75% Approved**: Visible to customers
- **10% Pending**: Awaiting moderation
- **10% Rejected**: Policy violations
- **5% Flagged**: Suspicious content

### Moderation Actions
Complete audit trail for all processed reviews with realistic moderator notes.

## Demo Scenarios

The interactive demo showcases:

### 1. User Review Workflow
- Creating a new review
- Updating existing review
- Viewing product statistics

### 2. Moderation Workflow
- Processing pending reviews
- Approving/rejecting reviews
- Handling flagged content
- Adding moderation notes

### 3. Statistics & Analytics
- Moderation performance metrics
- Review status distributions
- Product rating summaries
- Moderator activity reports

### 4. Error Handling
- Validation errors
- Authorization failures
- Not found scenarios

## API Testing

After seeding, you can test the API endpoints:

### User Endpoints
```bash
# Get product reviews
curl http://localhost:3000/api/products/1/reviews

# Get product rating
curl http://localhost:3000/api/products/1/rating

# Create review (requires authentication)
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"userId":1,"productId":1,"rating":5,"reviewText":"Great product!"}'
```

### Moderator Endpoints
```bash
# Get moderation queue (requires moderator)
curl -H "x-user-id: 11" http://localhost:3000/api/moderation/queue

# Get moderation statistics
curl -H "x-user-id: 11" http://localhost:3000/api/moderation/statistics

# Approve review
curl -X POST -H "x-user-id: 11" http://localhost:3000/api/moderation/approve/1
```

## Database Schema

The seeded database includes all tables with proper relationships:

```sql
-- Users with roles
users (id, username, email, role, created_at)

-- Products with categories  
products (id, name, description, category, created_at)

-- Reviews with ratings and status
reviews (id, user_id, product_id, rating, review_text, status, created_at, updated_at)

-- Moderation audit trail
moderation_actions (id, review_id, moderator_id, action, notes, created_at)
```

## Sample Data Statistics

After seeding, you'll have:
- **13 users** (10 regular + 3 moderators)
- **20 products** across 4 categories
- **150+ reviews** with realistic content
- **100+ moderation actions** for audit trail

## Authentication

The demo uses simple header-based authentication:
- Regular users: IDs 1-10
- Moderators: IDs 11-13
- Use `x-user-id` header for API requests

## Frontend Integration

The seeded data works perfectly with the React frontend:
1. Start backend: `npm start`
2. Start frontend: `cd ../frontend && npm run dev`
3. Browse products and reviews
4. Test moderation features (login as moderator)

## Customization

### Adding More Data
Edit `src/scripts/seedData.js` to:
- Add more users, products, or categories
- Adjust review distribution
- Modify sample review texts
- Change moderation patterns

### Demo Scenarios
Edit `src/scripts/demo.js` to:
- Add new workflow demonstrations
- Modify existing scenarios
- Include additional analytics
- Test specific edge cases

## Troubleshooting

### Database Issues
```bash
# Reset database completely
rm data/reviews.db
npm run init-db
npm run seed
```

### Permission Errors
Ensure the `data/` directory exists and is writable:
```bash
mkdir -p data
chmod 755 data
```

### Node.js Version
Requires Node.js 14+ for ES modules support.

## Next Steps

1. **Run Tests**: `npm test` to verify all functionality
2. **Start Development**: Use seeded data for frontend development
3. **API Documentation**: Check route files for complete API reference
4. **Production Setup**: Modify for production database and authentication

The demo provides a complete, realistic dataset for testing all system features and workflows!