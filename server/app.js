import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import bloodTestRoutes from './routes/bloodTestRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import campRoutes from './routes/campRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import { errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust Render's reverse proxy so req.ip and X-Forwarded-For work correctly.
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Body Parser & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Uploads Static Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root health and API information endpoints for Render and browser access.
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blood Bank Management API is running successfully.'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Active', message: 'Blood Bank API Server is healthy' });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blood Bank Management API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      donors: '/api/donors',
      hospitals: '/api/hospitals',
      inventory: '/api/inventory',
      donations: '/api/donations',
      bloodTests: '/api/blood-tests',
      requests: '/api/requests',
      camps: '/api/camps',
      dashboard: '/api/dashboard',
      reports: '/api/reports',
      notifications: '/api/notifications'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/blood-tests', bloodTestRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Centralized Error Handler
app.use(errorHandler);

export default app;
