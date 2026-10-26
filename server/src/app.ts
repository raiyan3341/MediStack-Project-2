import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import bloodRoutes from './routes/bloodRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { connectDB } from './config/db.js';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const allowedOrigins = [
    'https://medistack2.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...configuredOrigins,
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl / same-origin)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger in development
  app.use((req, _res, next) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // Ensure database is connected on requests
  app.use(async (_req, _res, next) => {
    try {
      await connectDB();
    } catch (e) {
      // handled
    }
    next();
  });

  // Health check
  const healthHandler = (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'MediStock Healthcare Supply Management API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  };

  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // Mount API Routes (support both /api/path and direct /path for Vercel rewrites)
  const mountRoutes = (prefix: string) => {
    app.use(`${prefix}/auth`, authRoutes);
    app.use(`${prefix}/categories`, categoryRoutes);
    app.use(`${prefix}/products`, productRoutes);
    app.use(`${prefix}/organizations`, organizationRoutes);
    app.use(`${prefix}/orders`, orderRoutes);
    app.use(`${prefix}/requests`, requestRoutes);
    app.use(`${prefix}/blood`, bloodRoutes);
    app.use(`${prefix}/admin`, adminRoutes);
    app.use(`${prefix}/notifications`, notificationRoutes);
  };

  mountRoutes('/api');
  mountRoutes('');

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Resource or API route not found.' });
  });

  return app;
};

const app = createApp();

// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
  // @ts-ignore
  module.exports = app;
  // @ts-ignore
  module.exports.default = app;
}

export default app;

