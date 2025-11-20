import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB().catch(err => {
  console.log('⚠️ MongoDB connection failed, but server will continue running');
  console.log('⚠️ Some features may not work without database connection');
});

// Middleware
app.use(helmet()); // Security headers

// Build dynamic CORS allow-list supporting LAN access and env overrides
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179'
];

const envOrigins = [
  process.env.CORS_ORIGIN,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])
]
  .filter(Boolean)
  .map((o) => o.trim());

const allowList = new Set([...defaultOrigins, ...envOrigins]);

const privateIpRegexes = [
  /^https?:\/\/10\.(?:\d{1,3}\.){2}\d{1,3}(?::\d+)?$/,
  /^https?:\/\/192\.168\.(?:\d{1,3})\.\d{1,3}(?::\d+)?$/,
  /^https?:\/\/172\.(?:1[6-9]|2[0-9]|3[0-1])\.(?:\d{1,3})\.\d{1,3}(?::\d+)?$/
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests or non-browser requests where origin is undefined
      if (!origin) return callback(null, true);

      if (allowList.has(origin)) return callback(null, true);

      if (privateIpRegexes.some((rx) => rx.test(origin))) return callback(null, true);

      return callback(new Error(`CORS blocked: ${origin} not allowed`));
    },
    credentials: true
  })
);
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Project Bolt API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});



// API Routes
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/users', (await import('./routes/users.js')).default);
app.use('/api/projects', (await import('./routes/projects.js')).default);
app.use('/api/tasks', (await import('./routes/tasks.js')).default);
app.use('/api/admin', (await import('./routes/admin.js')).default);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with auto-port fallback when EADDRINUSE
const desiredPort = parseInt(process.env.PORT || '5000', 10);
const maxAttempts = 6; // 5000..5005

const startServer = (port, attempt = 1) => {
  const srv = app
    .listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${port}/health`);
      console.log(`📱 Frontend: ${process.env.CORS_ORIGIN || 'http://localhost:5177'}`);
    })
    .on('error', (err) => {
      if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES') && attempt < maxAttempts) {
        const nextPort = port + 1;
        console.warn(`⚠️ Port ${port} unavailable (${err.code}). Trying ${nextPort}...`);
        startServer(nextPort, attempt + 1);
      } else {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
      }
    });
  return srv;
};

const server = startServer(desiredPort);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

export default app;
