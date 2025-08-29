import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { sendMail } from './utils/email';
import { 
  sendOverdueTaskNotifications, 
  sendUpcomingTaskNotifications 
} from './utils/taskNotification';
import cron from 'node-cron';
import { dataMaintenanceService } from './services/dataMaintenanceService';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import projectRoutes from './routes/project';
import documentRoutes from './routes/document';
import taskRoutes from './routes/task';
import containerRoutes from './routes/container';
import reportRoutes from './routes/report';
import dashboardRoutes from './routes/dashboard';
import activityRoutes from './routes/activity';
import calendarRoutes from './routes/calendar';
import issueRoutes from './routes/issue';
import activityLogRoutes from './routes/activityLog';
import isoRoutes from './routes/iso';
import settingsRoutes from './routes/settings';
import notesRoutes from './routes/notes';
import folderRoutes from './routes/folderRoutes';
import noteShareRoutes from './routes/noteShareRoutes';
import notificationRoutes from './routes/notification';
import checklistRoutes from './routes/checklist';
import approvalRoutes from './routes/approval';
import todoRoutes from './routes/todo';
import permissionsRoutes from './routes/permissions';
import userPreferencesRoutes from './routes/userPreferences';
import adminRoutes from './routes/admin';
import licenseRoutes from './routes/licenseRoutes';
import kaizenRoutes from './routes/kaizenRoutes';
import kaizenTagRoutes from './routes/kaizenTagRoutes';

// Middlewares
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/auth';
import { auditLogger } from './middlewares/auditLogger';

// Import prisma from db.ts
import { prisma } from './db';

// Calendar reminder job: chạy mỗi phút
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const in60min = new Date(now.getTime() + 60 * 60000);
  // Lấy các sự kiện có reminder, sắp diễn ra trong 60 phút tới, chưa gửi nhắc nhở
  const events = await prisma.calendarEvent.findMany({
    where: {
      reminder: { not: null },
      startDate: { gte: now, lte: in60min },
    },
    include: { attendees: { include: { user: true } } }
  });
  for (const event of events) {
    const minutesToStart = Math.round((new Date(event.startDate).getTime() - now.getTime()) / 60000);
    if (event.reminder && minutesToStart === event.reminder) {
      for (const attendee of event.attendees) {
        if (!attendee.user?.email) continue;
        if (['ACCEPTED', 'INVITED'].includes(attendee.status || 'INVITED')) {
          await sendMail({
            to: attendee.user.email,
            subject: `[Nhắc nhở] Sự kiện: ${event.title}`,
            html: `<p>Bạn có sự kiện <b>${event.title}</b> lúc ${new Date(event.startDate).toLocaleString()}.</p><p>Vui lòng kiểm tra lịch dự án để biết chi tiết.</p>`
          });
        }
      }
    }
  }
});

// Task notification jobs
// Overdue tasks: chạy mỗi giờ
cron.schedule('0 * * * *', async () => {
  console.log('Running overdue task notification job...');
  await sendOverdueTaskNotifications();
});

// Upcoming tasks: chạy mỗi 6 giờ
cron.schedule('0 */6 * * *', async () => {
  console.log('Running upcoming task notification job...');
  await sendUpcomingTaskNotifications();
});

// Create Express app
const app = express();
const server = http.createServer(app);

// Environment-aware CORS configuration
const getCorsOrigins = (): (string | RegExp)[] => {
  const env = process.env.NODE_ENV;
  const corsOrigin = process.env.CORS_ORIGIN;
  const isHeroku = process.env.DYNO || process.env.HEROKU_APP_NAME;
  
  console.log('Environment detection:', {
    NODE_ENV: env,
    CORS_ORIGIN: corsOrigin,
    isHeroku: !!isHeroku,
    DYNO: process.env.DYNO,
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME
  });
  
  // If CORS_ORIGIN is explicitly set, use it and ensure both HTTP and HTTPS versions
  if (corsOrigin) {
    const origins = corsOrigin.split(',').map(origin => origin.trim());
    const expandedOrigins = [];
    
    for (const origin of origins) {
      expandedOrigins.push(origin);
      // If it's HTTPS, also add HTTP version
      if (origin.startsWith('https://')) {
        const httpVersion = origin.replace('https://', 'http://');
        if (!expandedOrigins.includes(httpVersion)) {
          expandedOrigins.push(httpVersion);
        }
      }
      // If it's HTTP, also add HTTPS version
      if (origin.startsWith('http://')) {
        const httpsVersion = origin.replace('http://', 'https://');
        if (!expandedOrigins.includes(httpsVersion)) {
          expandedOrigins.push(httpsVersion);
        }
      }
    }
    
    console.log('Expanded CORS origins:', expandedOrigins);
    return expandedOrigins;
  }
  
  // Production environment (including Heroku)
  if (env === 'production' || isHeroku) {
    console.log('Using production CORS configuration');
    return [
      'https://minicde-production-589be4b0d52b.herokuapp.com',
      'https://minicde-frontend-833302d6ab3c.herokuapp.com',
      'http://qlda.hoanglong24.com',
      'https://qlda.hoanglong24.com',
      // Allow all Heroku app domains
      /^https:\/\/.*\.herokuapp\.com$/,
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/,
      /^https:\/\/.*\.railway\.app$/
    ];
  }
  
  // Development environment
  console.log('Using development CORS configuration');
  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost',
    'http://127.0.0.1',
    'http://qlda.hoanglong24.com',
    'https://qlda.hoanglong24.com',
    // Allow all localhost ports for development
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ];
};

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    const allowedOrigins = getCorsOrigins();
    
    console.log(`CORS: Checking origin: ${origin}`);
    console.log('CORS: Allowed origins:', allowedOrigins);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        // Allow all origins if '*' is present
        if (allowedOrigin === '*') {
          console.log('CORS: Allowing origin due to wildcard (*)');
          return true;
        }
        const matches = origin === allowedOrigin;
        if (matches) {
          console.log(`CORS: Origin matched string: ${allowedOrigin}`);
        }
        return matches;
      }
      if (allowedOrigin instanceof RegExp) {
        const matches = allowedOrigin.test(origin);
        if (matches) {
          console.log(`CORS: Origin matched regex: ${allowedOrigin}`);
        }
        return matches;
      }
      return false;
    });
    
    if (isAllowed) {
      console.log(`CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      console.log('CORS: Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Cache-Control',
    'Pragma',
    'X-Session-Id'
  ],
  exposedHeaders: [
    'Content-Length', 
    'X-Requested-With',
    'X-Total-Count',
    'X-Page-Count'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [
      'http://qlda.hoanglong24.com',
      'https://qlda.hoanglong24.com',
      'https://minicde-production-589be4b0d52b.herokuapp.com',
      'https://minicde-frontend-833302d6ab3c.herokuapp.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      // Allow all Heroku domains
      /^https:\/\/.*\.herokuapp\.com$/
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Set global io variable
(global as any).io = io;

// Trust proxy for Heroku - only trust the first proxy (Heroku's load balancer)
app.set('trust proxy', 1);

// Set up rate limiting with different limits for different endpoints
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '200'), // limit each IP to 200 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later.',
  handler: (req, res) => {
    console.log(`🚫 Rate limit exceeded for IP: ${req.ip} on auth endpoint`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please wait a few minutes before trying again',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000 / 60) // minutes
    });
  }
});

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5000'), // limit each IP to 5000 API requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many API requests from this IP, please try again later.'
});

// Simple CORS configuration for production
const isProduction = process.env.NODE_ENV === 'production' || process.env.DYNO || process.env.HEROKU_APP_NAME;

// Use the detailed CORS configuration for all environments
app.use(cors(corsOptions));
console.log('CORS: Using environment-specific configuration');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'self'", "https://view.officeapps.live.com", "https://docs.google.com"],
      frameAncestors: ["'self'"],
    },
  },
}));
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '20mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '20mb' }));

// Static files
// Serve uploaded files
const uploadsPath = path.join(__dirname, '../uploads');
console.log('Uploads directory path:', uploadsPath);

// Ensure uploads directory exists
import fs from 'fs';
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('Created uploads directory');
}

app.use('/uploads', express.static(uploadsPath));

// Audit log middleware (log tự động mọi thao tác thay đổi dữ liệu)
app.use(auditLogger);

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use(generalLimiter);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'MiniCDE Backend API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    corsOrigins: getCorsOrigins(),
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint for CORS testing
app.get('/debug/cors', (req, res) => {
  res.status(200).json({
    environment: process.env.NODE_ENV,
    corsOrigins: getCorsOrigins(),
    corsOriginEnv: process.env.CORS_ORIGIN,
    requestOrigin: req.headers.origin,
    allowedHeaders: corsOptions.allowedHeaders,
    methods: corsOptions.methods
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint to create a user (for debugging only) - BEFORE any middleware
app.post('/test/create-user', async (req, res) => {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });
    
    if (existingUser) {
      return res.status(200).json({ 
        message: 'Test user already exists',
        user: { email: existingUser.email, name: existingUser.name }
      });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        status: 'active',
        organization: 'Test Organization',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        organization: true,
        createdAt: true
      }
    });
    
    res.status(201).json({
      message: 'Test user created successfully',
      user,
      credentials: {
        email: 'admin@test.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ error: 'Failed to create test user', details: error.message });
  }
});

// Test endpoint for dashboard - BEFORE any middleware
app.get('/test/dashboard', (req, res) => {
  res.json({ 
    message: 'Dashboard test endpoint working', 
    timestamp: new Date(),
    path: req.path,
    method: req.method
  });
});

// Public routes (không cần authentication)
app.use('/api/checklist/public', checklistRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);
app.use('/api/containers', authMiddleware, containerRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/activities', authMiddleware, activityRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calendar', authMiddleware, calendarRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/activity-logs', authMiddleware, activityLogRoutes);
app.use('/api/iso', authMiddleware, isoRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api', noteShareRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/checklist', authMiddleware, checklistRoutes);
app.use('/api/approvals', authMiddleware, approvalRoutes);
app.use('/api/todos', authMiddleware, todoRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/user-preferences', userPreferencesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/kaizen', kaizenRoutes);
app.use('/api/kaizen-tags', kaizenTagRoutes);

// Serve frontend build for Heroku deployment
// Note: Frontend is now deployed separately, so we don't serve it from backend
// const frontendPath = path.join(__dirname, '../../public');
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(frontendPath));
//   
//   // Handle React routing, return all requests to React app
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(frontendPath, 'index.html'));
//   });
// }

// Error handling
app.use(errorHandler);

// Socket.IO connection
io.on('connection', (socket) => {
  socket.on('join-user', (userId: string) => {
    if (userId) {
      socket.join(`user:${userId}`);
      }
  });
  socket.on('disconnect', () => {
    });
  
  // Join project room for real-time updates
  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`);
    });
  
  // Leave project room
  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});

// Initialize data maintenance service
if (process.env.NODE_ENV === 'production') {
  dataMaintenanceService.initializeJobs();
  console.log('Data maintenance service initialized');
}

// Start server
const PORT = parseInt(process.env.PORT || '3001');
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`Redis: ${process.env.REDIS_URL ? 'Connected' : 'Not configured'}`);
}); 

// Trigger Heroku rebuild