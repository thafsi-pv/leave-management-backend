# Leave Management Backend

NestJS backend for the Leave Management System with PostgreSQL database integration.

## Features

- JWT Authentication
- User Management
- Leave Request Management
- Admin Reports
- System Configuration
- PostgreSQL Integration with Prisma ORM

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env file with your database credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/leave_management?schema=public"
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
```

3. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the development server:
```bash
npm run start:dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/leave_management?schema=public"
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
```

## API Documentation

The API will be available at `http://localhost:3001` when running.

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - User login
- `GET /auth/profile` - Get user profile

### Leave Management
- `POST /leave` - Create leave request
- `GET /leave` - Get leave requests
- `GET /leave/calendar` - Get calendar data
- `GET /leave/availability` - Check availability
- `PATCH /leave/:id` - Update leave request
- `DELETE /leave/:id` - Delete leave request

### Reports (Admin)
- `GET /reports/daily` - Daily reports
- `GET /reports/weekly` - Weekly reports
- `GET /reports/monthly` - Monthly reports

### Configuration (Admin)
- `GET /config/shift` - Get configuration
- `POST /config/shift` - Update configuration

## Database Schema

The application uses Prisma ORM with the following models:
- `User` - User accounts
- `Leave` - Leave requests  
- `Config` - System configuration

## Prisma Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Deploy migrations to production
npm run prisma:deploy

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Development

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```
# leave-management-backend
