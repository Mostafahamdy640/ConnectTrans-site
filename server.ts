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

// Determine production distribution directory and entry HTML safely
function resolveDistPaths() {
  const possiblePaths = [
    typeof __dirname !== 'undefined' ? path.join(__dirname, 'index.html') : '',
    path.join(process.cwd(), 'dist', 'index.html'),
    typeof __dirname !== 'undefined' ? path.join(__dirname, '..', 'dist', 'index.html') : '',
    typeof __dirname !== 'undefined' ? path.join(__dirname, 'dist', 'index.html') : '',
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return {
        distPath: path.dirname(p),
        indexHtmlPath: p,
      };
    }
  }

  const fallbackDist = path.resolve(process.cwd(), 'dist');
  return {
    distPath: fallbackDist,
    indexHtmlPath: path.join(fallbackDist, 'index.html'),
  };
}

const { distPath, indexHtmlPath } = resolveDistPaths();

// Import API Routers
import authRouter from './src/server/routes/auth.ts';
import requestsRouter from './src/server/routes/requests.ts';
import tripsRouter from './src/server/routes/trips.ts';
import walletRouter from './src/server/routes/wallet.ts';
import ratingsRouter from './src/server/routes/ratings.ts';
import documentsRouter from './src/server/routes/documents.ts';
import notificationsRouter from './src/server/routes/notifications.ts';
import adminRouter from './src/server/routes/admin.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const HOST = '0.0.0.0';

  // Trust reverse proxy (nginx / Cloud Run load balancer)
  app.set('trust proxy', 1);

  // Global body parsers with safety limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate Limiter to prevent abuse
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'تم تجاوز الحد المسموح للطلبات، يرجى المحاولة لاحقاً' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'محاولات دخول متكررة، يرجى الانتظار 15 دقيقة' },
  });

  app.use('/api/', apiLimiter);
  app.use('/api/auth/', authLimiter);

  // Health check endpoints for probes (Cloud Run & load balancers)
  app.get('/health', (req, res) => res.status(200).send('OK'));
  app.get('/healthz', (req, res) => res.status(200).send('OK'));
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

  // Development vs Production Frontend Handling
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction && !fs.existsSync(indexHtmlPath)) {
    try {
      console.log('[ConnectTrans] Development mode: Initializing Vite middleware...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('[ConnectTrans] Vite middleware could not be loaded:', err);
    }
  } else {
    console.log(`[ConnectTrans] Production mode: Serving static files from ${distPath}`);
    app.use(express.static(distPath, { maxAge: '1h' }));
    app.get('*', (req, res) => {
      const activeHtml = fs.existsSync(indexHtmlPath)
        ? indexHtmlPath
        : resolveDistPaths().indexHtmlPath;
      if (fs.existsSync(activeHtml)) {
        res.sendFile(activeHtml);
      } else {
        res.status(500).send('Connecting to ConnectTrans UI failed: Web app bundle index.html not found.');
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

  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 ConnectTrans Production Engine listening on http://${HOST}:${PORT}`);
  });

  return server;
}

startServer();
