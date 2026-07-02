import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/error.js';

// Routes
import authRoutes from './src/routes/auth.routes.js';
import boardMemberRoutes from './src/routes/boardMember.routes.js';
import serviceRoutes from './src/routes/service.routes.js';
import offerRoutes from './src/routes/offer.routes.js';
import lectureRoutes from './src/routes/lecture.routes.js';
import judgmentRoutes from './src/routes/judgment.routes.js';
import contractRoutes from './src/routes/contract.routes.js';
import governmentLinkRoutes from './src/routes/governmentLink.routes.js';
import activityRoutes from './src/routes/activity.routes.js';
import complaintRoutes from './src/routes/complaint.routes.js';
import settingsRoutes from './src/routes/settings.routes.js';
import statsRoutes from './src/routes/stats.routes.js';
import courtRoutes from './src/routes/court.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connectDB();

const app = express();

// Behind a reverse proxy (Railway / Vercel / Nginx) → trust the first proxy hop
// so express-rate-limit and req.ip read the real client IP from X-Forwarded-For.
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

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running', time: new Date() }));

// Mount routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/board-members', boardMemberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/judgments', judgmentRoutes);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
