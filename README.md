# Electronics Store Backend

A Node.js backend application for an electronics store, built with Express.js, TypeScript, and MongoDB.

## Features

- MongoDB Atlas integration
- Docker deployment support
- Authentication with JWT
- Admin user management
- Product management
- Category management
- Order management (prepared for implementation)
- Promotion management (prepared for implementation)
- Consultation requests (prepared for implementation)

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (for containerized deployment)
- MongoDB Atlas account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=your_environment
PORT=your_port
DB_HOST=your_db_host
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expires_in
CORS_ORIGIN=your_cors_origin
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Deployment

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

## API Endpoints

### Authentication
- POST /api/auth/login - Login with email and password
- POST /api/auth/change-password - Change user password (requires authentication)

### Products
- GET /api/products - Get all products
- GET /api/products/:id - Get product by ID
- POST /api/products - Create product (admin only)
- PUT /api/products/:id - Update product (admin only)
- DELETE /api/products/:id - Delete product (admin only)

### Categories
- GET /api/categories - Get all categories
- GET /api/categories/:id - Get category by ID
- POST /api/categories - Create category (admin only)
- PUT /api/categories/:id - Update category (admin only)
- DELETE /api/categories/:id - Delete category (admin only)

## Default Admin Account

The system creates a default administrator account on first run with the credentials specified in the environment variables in case the environment variables are not active then use the following information:
- Email: ADMIN_EMAIL (default: admin@example.com)
- Password: ADMIN_PASSWORD (default: admin)
