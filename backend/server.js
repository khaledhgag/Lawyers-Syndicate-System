import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import connectDB from './src/config/db.js';
import { uploadRoot } from './src/config/paths.js';
import { notFound, errorHandler } from './src/middleware/error.js';

// Routes
import authRoutes from './src/routes/auth.routes.js';
import boardMemberRoutes from './src/routes/boardMember.routes.js';
import serviceRoutes from './src/routes/service.routes.js';
import offerRoutes from './src/routes/offer.routes.js';
import lectureRoutes from './src/routes/lecture.routes.js';
import judgmentRoutes from './src/routes/judgment.routes.js';
import bookRoutes from './src/routes/book.routes.js';
import contractRoutes from './src/routes/contract.routes.js';
import governmentLinkRoutes from './src/routes/governmentLink.routes.js';
import activityRoutes from './src/routes/activity.routes.js';
import complaintRoutes from './src/routes/complaint.routes.js';
import settingsRoutes from './src/routes/settings.routes.js';
import statsRoutes from './src/routes/stats.routes.js';
import courtRoutes from './src/routes/court.routes.js';

// --- Global safety nets ---------------------------------------------------
// Log fatal async errors but keep the HTTP server alive. A background failure
// (e.g. a dropped DB socket) must never crash the process and cause 503s.
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});

// Validate critical env vars at boot (warn, never crash — health must stay up)
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length) console.error(`⚠️  Missing required env vars: ${missingEnv.join(', ')}`);
if (!process.env.CLIENT_URL) console.warn('⚠️  CLIENT_URL not set — CORS will allow all origins.');

const app = express();

// Behind a reverse proxy (Hostinger / Railway / Vercel / Nginx) → trust the first
// proxy hop so express-rate-limit and req.ip read the real client IP.
app.set('trust proxy', 1);

// Security & parsing
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// Allowed origins from CLIENT_URL (comma-separated), normalized (no trailing slash)
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser requests (curl, health checks, server-to-server)
      if (!origin) return cb(null, true);
      const clean = origin.replace(/\/+$/, '');
      const ok =
        allowedOrigins.length === 0 || // no CLIENT_URL set → allow all
        allowedOrigins.includes(clean) ||
        clean.endsWith('.vercel.app'); // allow Vercel production + preview deploys
      return ok ? cb(null, true) : cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(compression());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Rate limiting for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'عدد كبير من الطلبات، حاول لاحقاً' },
});
app.use('/api', apiLimiter);

// Stricter limiter for auth
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

// Static uploads (long cache — filenames are unique/immutable)
// Allow files (PDF/images) to be embedded in an <iframe> on the frontend by
// dropping the X-Frame-Options header that helmet sets for other responses.
app.use(
  '/uploads',
  express.static(uploadRoot, {
    maxAge: '7d',
    etag: true,
    setHeaders: (res) => {
      res.removeHeader('X-Frame-Options');
    },
  })
);

// Health — registered BEFORE the database connects, so it always responds 200
// even while MongoDB is still connecting or unavailable.
app.get('/api/health', (req, res) =>
  res.json({
    success: true,
    message: 'API is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'not-connected',
    cwd: process.cwd(),
    uploadRoot,
    uploadEnv: process.env.UPLOAD_DIR || null,
    time: new Date(),
  })
);

// Mount routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/board-members', boardMemberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/judgments', judgmentRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/government-links', governmentLinkRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/courts', courtRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

// --- Start the HTTP server FIRST, then connect to MongoDB in the background ---
// Binding the port immediately guarantees the platform's reverse proxy has an
// upstream to reach (no 503), regardless of database availability.
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on 0.0.0.0:${PORT} (${process.env.NODE_ENV || 'development'})`);

  // Connect after the port is bound. A DB failure must never stop the server.
  connectDB().catch((err) => console.error('❌ Database initialization error:', err));
});

server.on('error', (err) => {
  console.error('💥 HTTP server error:', err);
});
