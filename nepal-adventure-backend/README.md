# Nepal Adventures Backend API

A comprehensive backend API for Nepal Adventures platform built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Tourist, Guide, Porter, Gear Provider, Admin)
  - Password reset functionality
  - Email verification

- **User Roles & Profiles**
  - Tourist profiles with medical info and preferences
  - Guide profiles with certifications, specializations, and pricing
  - Porter profiles with capacity, experience, and routes
  - Gear provider profiles for equipment rental

- **Adventure Management**
  - Complete adventure listings with detailed information
  - Search and filtering capabilities
  - Availability checking
  - Reviews and ratings

- **Booking System**
  - End-to-end booking workflow
  - Payment integration ready
  - Booking status tracking
  - Trip progress updates

- **Review System**
  - Multi-target reviews (guides, porters, adventures)
  - Rating breakdown and analytics
  - Review moderation

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nepal-adventure-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nepal-adventures
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
```

5. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+977-1234567890",
  "role": "tourist"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Adventure Endpoints

#### Get All Adventures
```http
GET /api/adventures?type=trekking&region=everest&difficulty=moderate&page=1&limit=12
```

#### Get Single Adventure
```http
GET /api/adventures/:id
```

#### Create Adventure (Admin/Provider only)
```http
POST /api/adventures
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Everest Base Camp Trek",
  "description": "Classic trek to Everest Base Camp...",
  "type": "trekking",
  "location": {
    "region": "everest",
    "startingPoint": "Lukla"
  },
  "duration": {
    "days": 14
  },
  "difficulty": {
    "level": "challenging"
  },
  "pricing": {
    "basePrice": 1500
  }
}
```

### Guide Endpoints

#### Get All Guides
```http
GET /api/guides?specializations=trekking,climbing&languages=english&region=everest
```

#### Get Single Guide
```http
GET /api/guides/:id
```

#### Create Guide Profile
```http
POST /api/guides
Authorization: Bearer <token>
Content-Type: application/json

{
  "licenseNumber": "NTB-12345",
  "specializations": ["trekking", "climbing"],
  "languages": [
    {"language": "english", "proficiency": "fluent"},
    {"language": "nepali", "proficiency": "native"}
  ],
  "experience": {
    "years": 10,
    "description": "Experienced mountain guide..."
  },
  "pricing": {
    "dailyRate": 120
  }
}
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "adventure": "adventure_id",
  "guide": "guide_id",
  "tripDetails": {
    "startDate": "2024-03-15",
    "endDate": "2024-03-28",
    "groupSize": 4,
    "participants": [
      {
        "name": "John Doe",
        "age": 30,
        "nationality": "American"
      }
    ]
  }
}
```

#### Get My Bookings
```http
GET /api/bookings
Authorization: Bearer <token>
```

### Query Parameters

Most list endpoints support these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (rating, price, experience, name)
- `search` - Text search
- Various filters specific to each endpoint

### Response Format

All responses follow this format:

```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "pagination": {
    "next": { "page": 2, "limit": 10 },
    "prev": { "page": 1, "limit": 10 }
  },
  "data": [...]
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

## Database Models

### User Model
- Basic user information (name, email, phone)
- Role-based access (tourist, guide, porter, gear_provider)
- Authentication fields
- Profile preferences

### Guide Model
- Professional information (license, certifications)
- Specializations and operating areas
- Languages and experience
- Pricing and availability
- Reviews and ratings

### Porter Model
- Physical capabilities (carrying capacity, max altitude)
- Route familiarity and experience
- Skills and equipment
- Health certificates

### Adventure Model
- Complete adventure details
- Itinerary and requirements
- Pricing and availability
- Safety information

### Booking Model
- Trip details and participants
- Pricing breakdown
- Payment tracking
- Progress updates
- Communication history

## Security Features

- **Authentication**: JWT tokens with configurable expiration
- **Authorization**: Role-based access control
- **Validation**: Input validation using express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable CORS settings
- **Password Security**: bcrypt hashing

## Error Handling

The API includes comprehensive error handling:
- Input validation errors
- Authentication/authorization errors
- Database errors
- File upload errors
- Rate limiting errors

## File Upload

File upload is configured for:
- Profile images
- Document verification
- Adventure photos
- Review photos

Supports Cloudinary integration for cloud storage.

## Development

### Project Structure
```
├── config/         # Configuration files
├── controllers/    # Route controllers (not implemented yet)
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── utils/          # Utility functions
├── uploads/        # Local file uploads (if not using cloud storage)
├── server.js       # Entry point
└── package.json    # Dependencies
```

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Environment Variables
See `.env.example` for all available environment variables.

## Deployment

The API is ready for deployment to platforms like:
- Heroku
- AWS (EC2, Elastic Beanstalk, Lambda)
- Google Cloud Platform
- DigitalOcean
- Vercel (for serverless)

Make sure to:
1. Set all required environment variables
2. Configure MongoDB connection
3. Set up Cloudinary for file uploads
4. Configure email service for notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when testing is set up)
5. Submit a pull request

## License

This project is licensed under the MIT License.