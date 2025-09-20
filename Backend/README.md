# Manufacturing ERP Backend

A comprehensive Node.js backend API for a Manufacturing ERP system built with Express.js, Prisma ORM, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Manufacturing Orders**: Complete order lifecycle management
- **Work Orders**: Task management and progress tracking
- **BOM Management**: Bill of materials with components and operations
- **Work Centers**: Production facility management
- **Inventory Management**: Real-time stock tracking and movements
- **Dashboard & Analytics**: KPI tracking and reporting
- **User Management**: Multi-role user system

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5+
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/manufacturing_erp"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:5173"
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/kpis` - Get detailed KPIs
- `GET /api/dashboard/recent-orders` - Get recent orders
- `GET /api/dashboard/alerts` - Get system alerts

### Manufacturing Orders
- `GET /api/manufacturing-orders` - Get all orders
- `POST /api/manufacturing-orders` - Create new order
- `GET /api/manufacturing-orders/:id` - Get single order
- `PUT /api/manufacturing-orders/:id` - Update order
- `DELETE /api/manufacturing-orders/:id` - Delete order
- `POST /api/manufacturing-orders/:id/confirm` - Confirm order
- `POST /api/manufacturing-orders/:id/start` - Start order
- `POST /api/manufacturing-orders/:id/complete` - Complete order
- `POST /api/manufacturing-orders/:id/cancel` - Cancel order

### Work Orders
- `GET /api/work-orders` - Get all work orders
- `POST /api/work-orders` - Create work order
- `GET /api/work-orders/:id` - Get single work order
- `PUT /api/work-orders/:id` - Update work order
- `POST /api/work-orders/:id/start` - Start work order
- `POST /api/work-orders/:id/pause` - Pause work order
- `POST /api/work-orders/:id/resume` - Resume work order
- `POST /api/work-orders/:id/complete` - Complete work order
- `GET /api/work-orders/my-assignments` - Get user's assignments

### BOM Management
- `GET /api/boms` - Get all BOMs
- `POST /api/boms` - Create BOM
- `GET /api/boms/:id` - Get single BOM
- `PUT /api/boms/:id` - Update BOM
- `DELETE /api/boms/:id` - Delete BOM
- `POST /api/boms/:id/activate` - Activate BOM
- `GET /api/boms/product/:productId` - Get BOMs for product

### Work Centers
- `GET /api/work-centers` - Get all work centers
- `POST /api/work-centers` - Create work center
- `GET /api/work-centers/:id` - Get single work center
- `PUT /api/work-centers/:id` - Update work center
- `DELETE /api/work-centers/:id` - Delete work center
- `GET /api/work-centers/:id/utilization` - Get utilization data
- `GET /api/work-centers/:id/schedule` - Get work center schedule

### Products & Inventory
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/stock` - Get stock information
- `POST /api/products/:id/stock-adjustment` - Adjust stock

### Stock Management
- `GET /api/stock-movements` - Get stock movements
- `POST /api/stock-movements` - Create stock movement
- `GET /api/stock-movements/product/:productId` - Get product movements
- `GET /api/inventory/summary` - Get inventory summary
- `GET /api/inventory/low-stock` - Get low stock products

### Reports
- `GET /api/reports/production-summary` - Production summary report
- `GET /api/reports/resource-utilization` - Resource utilization report
- `GET /api/reports/inventory-valuation` - Inventory valuation report
- `GET /api/reports/work-order-performance` - Work order performance report
- `POST /api/reports/export` - Export report data

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/change-password` - Change password

## User Roles

- **ADMIN**: Full system access
- **MANUFACTURING_MANAGER**: Manufacturing operations management
- **SHOP_FLOOR_OPERATOR**: Work order execution
- **INVENTORY_MANAGER**: Inventory and stock management
- **BUSINESS_OWNER**: Business-level access

## Sample Data

The seed script creates sample data including:
- 4 users with different roles
- 4 work centers
- 5 products (raw materials, components, finished goods)
- 2 BOMs with components and operations
- 3 manufacturing orders
- 6 work orders
- 5 stock movements

### Login Credentials
- **Admin**: admin@manufacturing.com / password123
- **Manager**: manager@manufacturing.com / password123
- **Operator**: operator@manufacturing.com / password123
- **Inventory**: inventory@manufacturing.com / password123

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database and seed

### Database Schema

The database schema includes:
- Users with role-based access
- Products with inventory tracking
- BOMs with components and operations
- Work centers for production facilities
- Manufacturing orders with status tracking
- Work orders for task management
- Stock movements for inventory tracking

## Security Features

- JWT-based authentication
- Role-based authorization
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Error Handling

- Global error handler middleware
- Proper HTTP status codes
- Detailed error messages in development
- Prisma error handling
- Validation error responses

## API Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {}, // Response data
  "error": "Error message if success is false"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
