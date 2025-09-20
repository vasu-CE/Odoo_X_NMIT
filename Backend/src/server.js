import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import manufacturingOrderRoutes from './routes/manufacturingOrders.js';
import workOrderRoutes from './routes/workOrders.js';
import bomRoutes from './routes/boms.js';
import workCenterRoutes from './routes/workCenters.js';
import productRoutes from './routes/products.js';
import stockRoutes from './routes/stock.js';
import stockLedgerRoutes from './routes/stockLedger.js';
import reportRoutes from './routes/reports.js';
import userRoutes from './routes/users.js';

import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware - parses cookies from request headers
// Enables access to cookies via req.cookies object
app.use(cookieParser());

app.use(compression());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/manufacturing-orders', manufacturingOrderRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/boms', bomRoutes);
app.use('/api/work-centers', workCenterRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock-movements', stockRoutes);
app.use('/api/stock-ledger', stockLedgerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
