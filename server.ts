import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Global error handlers to prevent container crashes on Cloud Run
process.on('uncaughtException', (err) => {
  console.error('[Process Uncaught Exception]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process Unhandled Rejection]:', reason);
});

// Load environment variables
dotenv.config();

// Determine production mode and paths reliably
const currentDir = typeof __dirname !== 'undefined' ? __dirname : path.resolve();
const distPath = fs.existsSync(path.join(currentDir, 'index.html'))
  ? currentDir
  : path.join(process.cwd(), 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');
const hasDist = fs.existsSync(indexHtmlPath);
const isProduction = process.env.NODE_ENV === 'production' || hasDist;

if (isProduction) {
  process.env.NODE_ENV = 'production';
}

// Import API Routers
import authRouter from './src/server/routes/auth.ts';
import requestsRouter from './src/server/routes/requests.ts';
import tripsRouter from './src/server/routes/trips.ts';
import walletRouter from './src/server/routes/wallet.ts';
import ratingsRouter from './src/server/routes/ratings.ts';
import documentsRouter from './src/server/routes/documents.ts';
import notificationsRouter from './src/server/routes/notifications.ts';
import adminRouter from './src/server/routes/admin.ts';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Global body parsers with safety limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter to prevent abuse (Requirement 10: "API آمن مع Validation وRBAC وRate Limiting")
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'تم تجاوز الحد المسموح للطلبات، يرجى المحاولة لاحقاً' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 login/register attempts per 15 min
  message: { error: 'محاولات دخول متكررة، يرجى الانتظار 15 دقيقة' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Health check endpoint (for Cloud Run & load balancer readiness/liveness probes)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'ConnectTrans Production Node.js/Express Engine',
    database: Boolean(process.env.SQL_HOST || process.env.DATABASE_URL) ? 'PostgreSQL (Cloud SQL / Pool)' : 'Resilient Memory DB (Seed Initialized)',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    version: '2.4.0',
  });
});

// Mount API Routes FIRST
app.use('/api/auth', authRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// Catch-all for unknown /api/* endpoints
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'نقطة النهاية المطلوبة غير موجودة', path: req.path });
});

// Production static assets & SPA fallback
if (isProduction || hasDist) {
  console.log(`[ConnectTrans] Production mode: Serving static files from ${distPath}`);
  app.use(express.static(distPath, { maxAge: '1h' }));
  app.get('*', (req, res) => {
    if (fs.existsSync(indexHtmlPath)) {
      res.sendFile(indexHtmlPath);
    } else {
      res.status(200).send('ConnectTrans Server is active and preparing assets...');
    }
  });
}

// Error Handling Middleware (Registered AFTER all routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'حدث خطأ داخلي في الخادم',
    timestamp: new Date().toISOString(),
  });
});

// Start listening immediately so Cloud Run health check and ingress pass instantly
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 ConnectTrans Production Engine listening on http://${HOST}:${PORT}`);
});

// Vite Middleware for development only
if (!isProduction && !hasDist) {
  (async () => {
    try {
      console.log('[ConnectTrans] Running in DEVELOPMENT mode. Initializing Vite middleware...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('[ConnectTrans] Vite middleware could not be loaded in dev mode:', err);
    }
  })();
}

export default app;
