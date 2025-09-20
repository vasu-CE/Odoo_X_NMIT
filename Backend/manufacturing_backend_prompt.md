# Manufacturing ERP Backend Development - Cursor Prompt

## Project Context
You are building the backend for an existing Manufacturing ERP System. The frontend is already implemented and expects specific API endpoints and data structures. Your task is to create a robust Node.js backend that serves the manufacturing management application with PostgreSQL database and Prisma ORM.

## Technology Stack Requirements
- **Runtime**: Node.js 18+ with Javascript
- **Framework**: Express.js with javascript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5+
- **Authentication**: JWT with bcrypt
- **Validation**: Zod or Joi
- **Security**: Helmet, CORS, rate limiting
<!-- - **Testing**: Jest with Supertest -->
- **Documentation**: Swagger/OpenAPI

## Database Schema Design

### Core Models (Prisma Schema)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      UserRole
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  manufacturingOrders ManufacturingOrder[]
  workOrders         WorkOrder[]
  createdBOMs        BOM[]

  @@map("users")
}

model Product {
  id            String      @id @default(cuid())
  name          String
  description   String?
  type          ProductType
  unit          String      @default("PCS")
  salesPrice    Float?
  purchasePrice Float?
  currentStock  Int         @default(0)
  reorderPoint  Int         @default(0)
  hsnCode       String?
  category      String?
  isActive      Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  boms                BOM[]
  manufacturingOrders ManufacturingOrder[]
  bomComponents       BOMComponent[]
  stockMovements      StockMovement[]

  @@map("products")
}

model BOM {
  id          String    @id @default(cuid())
  productId   String
  version     String    @default("1.0")
  isActive    Boolean   @default(true)
  createdById String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  product    Product        @relation(fields: [productId], references: [id])
  createdBy  User           @relation(fields: [createdById], references: [id])
  components BOMComponent[]
  operations BOMOperation[]

  @@unique([productId, version])
  @@map("boms")
}

model BOMComponent {
  id        String  @id @default(cuid())
  bomId     String
  productId String
  quantity  Float
  unit      String  @default("PCS")
  wastage   Float   @default(0)

  // Relations
  bom     BOM     @relation(fields: [bomId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@map("bom_components")
}

model BOMOperation {
  id           String @id @default(cuid())
  bomId        String
  sequence     Int
  name         String
  description  String?
  timeMinutes  Int
  workCenterId String

  // Relations
  bom        BOM        @relation(fields: [bomId], references: [id], onDelete: Cascade)
  workCenter WorkCenter @relation(fields: [workCenterId], references: [id])

  @@map("bom_operations")
}

model WorkCenter {
  id           String            @id @default(cuid())
  name         String
  description  String?
  hourlyRate   Float
  capacity     Int               @default(1)
  status       WorkCenterStatus  @default(ACTIVE)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  // Relations
  operations BOMOperation[]
  workOrders WorkOrder[]

  @@map("work_centers")
}

model ManufacturingOrder {
  id              String               @id @default(cuid())
  orderNumber     String               @unique
  productId       String
  quantity        Int
  status          ManufacturingStatus  @default(PLANNED)
  priority        Priority             @default(MEDIUM)
  scheduledDate   DateTime
  startedAt       DateTime?
  completedAt     DateTime?
  assignedToId    String?
  bomId           String?
  estimatedCost   Float?
  actualCost      Float?
  notes           String?
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  // Relations
  product      Product     @relation(fields: [productId], references: [id])
  assignedTo   User?       @relation(fields: [assignedToId], references: [id])
  bom          BOM?        @relation(fields: [bomId], references: [id])
  workOrders   WorkOrder[]

  @@map("manufacturing_orders")
}

model WorkOrder {
  id                     String            @id @default(cuid())
  manufacturingOrderId   String
  operationName          String
  sequence               Int
  status                 WorkOrderStatus   @default(PENDING)
  workCenterId           String
  assignedToId           String?
  estimatedTimeMinutes   Int
  actualTimeMinutes      Int?
  startedAt              DateTime?
  pausedAt               DateTime?
  completedAt            DateTime?
  comments               String?
  createdAt              DateTime          @default(now())
  updatedAt              DateTime          @updatedAt

  // Relations
  manufacturingOrder ManufacturingOrder @relation(fields: [manufacturingOrderId], references: [id], onDelete: Cascade)
  workCenter         WorkCenter         @relation(fields: [workCenterId], references: [id])
  assignedTo         User?              @relation(fields: [assignedToId], references: [id])

  @@map("work_orders")
}

model StockMovement {
  id              String       @id @default(cuid())
  productId       String
  movementType    MovementType
  quantity        Int
  unitCost        Float?
  totalValue      Float?
  reference       String?
  referenceId     String?
  notes           String?
  transactionDate DateTime     @default(now())
  createdAt       DateTime     @default(now())

  // Relations
  product Product @relation(fields: [productId], references: [id])

  @@map("stock_movements")
}

// Enums
enum UserRole {
  ADMIN
  MANUFACTURING_MANAGER
  SHOP_FLOOR_OPERATOR
  INVENTORY_MANAGER
  BUSINESS_OWNER
}

enum ProductType {
  RAW_MATERIAL
  WIP
  FINISHED_GOOD
  CONSUMABLE
}

enum WorkCenterStatus {
  ACTIVE
  MAINTENANCE
  INACTIVE
}

enum ManufacturingStatus {
  PLANNED
  CONFIRMED
  IN_PROGRESS
  QUALITY_HOLD
  COMPLETED
  CANCELED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum WorkOrderStatus {
  PENDING
  IN_PROGRESS
  PAUSED
  COMPLETED
  SKIPPED
}

enum MovementType {
  IN
  OUT
  TRANSFER
  ADJUSTMENT
}
```

## Required API Endpoints

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-otp
GET  /api/auth/me
```

### Dashboard Endpoints
```
GET /api/dashboard/overview
GET /api/dashboard/kpis
GET /api/dashboard/recent-orders
GET /api/dashboard/alerts
```

### Manufacturing Orders
```
GET    /api/manufacturing-orders
POST   /api/manufacturing-orders
GET    /api/manufacturing-orders/:id
PUT    /api/manufacturing-orders/:id
DELETE /api/manufacturing-orders/:id
POST   /api/manufacturing-orders/:id/confirm
POST   /api/manufacturing-orders/:id/start
POST   /api/manufacturing-orders/:id/complete
POST   /api/manufacturing-orders/:id/cancel
GET    /api/manufacturing-orders/:id/work-orders
```

### Work Orders
```
GET  /api/work-orders
POST /api/work-orders
GET  /api/work-orders/:id
PUT  /api/work-orders/:id
POST /api/work-orders/:id/start
POST /api/work-orders/:id/pause
POST /api/work-orders/:id/resume
POST /api/work-orders/:id/complete
GET  /api/work-orders/my-assignments
```

### Bill of Materials (BOM)
```
GET    /api/boms
POST   /api/boms
GET    /api/boms/:id
PUT    /api/boms/:id
DELETE /api/boms/:id
POST   /api/boms/:id/activate
GET    /api/boms/product/:productId
```

### Work Centers
```
GET    /api/work-centers
POST   /api/work-centers
GET    /api/work-centers/:id
PUT    /api/work-centers/:id
DELETE /api/work-centers/:id
GET    /api/work-centers/:id/utilization
GET    /api/work-centers/:id/schedule
```

### Products & Inventory
```
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/:id/stock
POST   /api/products/:id/stock-adjustment
```

### Stock Management
```
GET  /api/stock-movements
POST /api/stock-movements
GET  /api/stock-movements/product/:productId
GET  /api/inventory/summary
GET  /api/inventory/low-stock
```

### Reports
```
GET /api/reports/production-summary
GET /api/reports/resource-utilization
GET /api/reports/inventory-valuation
GET /api/reports/work-order-performance
POST /api/reports/export
```

### User Management
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/profile
PUT    /api/users/profile
```

## Backend Implementation Tasks

### Phase 1: Foundation Setup (Hours 1-3)
1. **Project Initialization**
   - Initialize Node.js project with TypeScript
   - Configure Prisma with PostgreSQL
   - Set up Express server with middleware
   - Configure environment variables and secrets

2. **Database Setup**
   - Create Prisma schema with all models
   - Generate and run initial migration
   - Seed database with sample data
   - Set up database connection pooling

3. **Authentication System**
   - Implement JWT token generation and validation
   - Create password hashing with bcrypt
   - Build middleware for route protection
   - Add role-based access control

### Phase 2: Core Business Logic (Hours 4-8)
4. **Manufacturing Orders Module**
   - CRUD operations for manufacturing orders
   - Auto-generate order numbers
   - BOM integration and material calculation
   - Status workflow implementation (Planned → Confirmed → In Progress → Completed)

5. **Work Orders Management**
   - Auto-generate work orders from manufacturing orders
   - Implement start/pause/resume/complete functionality
   - Time tracking with actual vs estimated
   - Operator assignment and notifications

6. **BOM Management**
   - Multi-level BOM creation and editing
   - Component and operation management
   - Version control for BOM changes
   - Material requirement calculations

### Phase 3: Inventory & Stock (Hours 9-12)
7. **Product Master**
   - CRUD operations for products
   - Stock level management
   - Reorder point alerts
   - Product categorization

8. **Stock Movement System**
   - Real-time inventory tracking
   - Automatic stock updates from work orders
   - Stock adjustment capabilities
   - Movement history and audit trail

9. **Work Centers Module**
   - Work center management
   - Capacity and utilization tracking
   - Hourly rate configuration
   - Performance analytics

### Phase 4: Advanced Features (Hours 13-16)
10. **Dashboard & Analytics**
    - Real-time KPI calculations
    - Production efficiency metrics
    - Resource utilization reports
    - Alert system for delays and low stock

11. **Reporting System**
    - Production summary reports
    - Cost analysis and variance reporting
    - Export functionality (PDF/Excel)
    - Custom report builder

12. **Real-time Updates**
    - WebSocket integration for live updates
    - Event-driven architecture
    - Notification system
    - Cache management with Redis

### Phase 5: Security & Optimization (Hours 17-20)
13. **Security Implementation**
    - Input validation and sanitization
    - SQL injection prevention
    - Rate limiting and DDoS protection
    - API security headers

14. **Performance Optimization**
    - Database query optimization
    - API response caching
    - Pagination for large datasets
    - Database indexing strategy

15. **Testing & Documentation**
    - Unit tests for business logic
    - Integration tests for API endpoints
    - API documentation with Swagger
    - Error handling and logging

## Key Business Logic Implementation

### Manufacturing Order Auto-Population
```typescript
// When creating MO, auto-populate materials from BOM
const createManufacturingOrder = async (data: CreateMOData) => {
  const bom = await prisma.bOM.findFirst({
    where: { productId: data.productId, isActive: true },
    include: { components: true, operations: true }
  });
  
  // Calculate scaled material requirements
  const materialRequirements = bom.components.map(comp => ({
    productId: comp.productId,
    requiredQuantity: comp.quantity * data.quantity,
    availableStock: comp.product.currentStock
  }));
  
  // Generate work orders from BOM operations
  const workOrders = bom.operations.map(op => ({
    operationName: op.name,
    sequence: op.sequence,
    estimatedTimeMinutes: op.timeMinutes * data.quantity,
    workCenterId: op.workCenterId
  }));
};
```

### Stock Movement Auto-Updates
```typescript
// When work order completes, update stock levels
const completeWorkOrder = async (workOrderId: string) => {
  const workOrder = await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { 
      status: 'COMPLETED',
      completedAt: new Date()
    },
    include: { 
      manufacturingOrder: { 
        include: { bom: { include: { components: true } } } 
      } 
    }
  });
  
  // If last operation, consume materials and produce finished goods
  if (isLastOperation) {
    // Stock OUT - consume raw materials
    await Promise.all(
      bom.components.map(comp => 
        createStockMovement({
          productId: comp.productId,
          movementType: 'OUT',
          quantity: comp.quantity * mo.quantity
        })
      )
    );
    
    // Stock IN - produce finished goods
    await createStockMovement({
      productId: mo.productId,
      movementType: 'IN',
      quantity: mo.quantity
    });
  }
};
```

## Error Handling & Validation
- Implement global error handler middleware
- Use Zod schemas for request validation
- Custom error classes for business logic errors
- Proper HTTP status codes and error messages
- Logging with Winston or similar

## Performance Requirements
- API response time < 200ms for simple queries
- Support for 100+ concurrent users
- Efficient database queries with proper joins
- Caching strategy for frequently accessed data
- Pagination for large result sets

## Testing Strategy
- Unit tests for business logic functions
- Integration tests for API endpoints
- Database tests with test containers
- Authentication and authorization tests
- Performance tests for high-load scenarios

## Deployment Preparation
- Docker containerization
- Environment-specific configurations
- Database migration scripts
- Health check endpoints
- Monitoring and logging setup

## Critical Success Factors
1. **Data Consistency** - Ensure stock levels always match actual movements
2. **Real-time Updates** - Manufacturing status changes must be immediate
3. **Scalability** - Support growing number of orders and users
4. **Security** - Protect sensitive manufacturing and business data
5. **Performance** - Fast response times for shop floor operations

Focus on building a robust, production-ready backend that seamlessly integrates with the existing frontend while handling the complex manufacturing business logic accurately and efficiently.