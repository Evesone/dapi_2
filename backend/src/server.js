const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - More permissive to avoid blocking requests
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, health checks)
    if (!origin) return callback(null, true);
    
    // Always allow in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000', // Local development
      'http://localhost:3001',
      'https://dapi-clothes.vercel.app', // Your actual Vercel domain
      process.env.FRONTEND_URL, // Environment variable for frontend URL
      'https://dapi-clothes.onrender.com', // Render backend URL for internal requests
      'https://dapi-2.onrender.com' // Current Render backend URL
    ].filter(Boolean); // Remove any undefined values
    
    // Be permissive - allow all origins in production to avoid CORS issues
    // You can restrict this later if needed
    console.log('CORS request from origin:', origin);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24 hours
};

// Middleware - Apply CORS before other middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increase limit for large AI requests
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Increase timeout for AI requests
app.use((req, res, next) => {
  if (req.path.includes('/ai/')) {
    req.setTimeout(300000); // 5 minutes for AI requests
    res.setTimeout(300000);
  }
  next();
});

// Import database
const { initializeDatabase } = require('./config/database');

// Import routes
console.log('Loading routes...');
const orderRoutes = require('./routes/orders');
const razorpayRoutes = require('./routes/razorpay');
const aiRoutes = require('./routes/ai');
const promoCodeRoutes = require('./routes/promoCodes');

console.log('Routes loaded successfully');

// Use routes
app.use('/api/orders', orderRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/promo-codes', promoCodeRoutes);

console.log('Routes registered successfully');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DAPI Backend is running' });
});

// Debug endpoint to list all routes
app.get('/debug/routes', (req, res) => {
  const routes = [
    'GET /health',
    'GET /debug/routes',
    'POST /api/orders',
    'GET /api/orders',
    'GET /api/orders/:id',
    'POST /api/orders/save-for-later',
    'GET /api/orders/saved/:id',
    'POST /api/razorpay/create-order',
    'POST /api/razorpay/verify-payment',
    'GET /api/ai/test',
    'POST /api/ai/generate-design-ideas',
    'POST /api/ai/generate-design-image',
    'POST /api/ai/generate-avatar-views'
  ];
  
  res.json({ 
    message: 'Available routes',
    routes: routes,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware - Must include CORS headers
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  console.error('Error message:', err.message);
  
  // Ensure CORS headers are set even on errors
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({ 
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler - Include CORS headers
app.use('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Start server with database initialization
async function startServer() {
  try {
    console.log('🚀 Starting DAPI Backend Server...');
    console.log(`📦 Node version: ${process.version}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 GOOGLE_AI_API_KEY: ${process.env.GOOGLE_AI_API_KEY ? 'SET (' + process.env.GOOGLE_AI_API_KEY.length + ' chars)' : 'NOT SET'}`);
    
    // Initialize database (don't block server startup if it fails)
    try {
      const dbInitialized = await initializeDatabase();
      if (!dbInitialized) {
        console.warn('⚠️  Database initialization failed, but server will continue...');
      }
    } catch (dbError) {
      console.error('⚠️  Database initialization error (server will continue):', dbError.message);
      // Don't exit - allow server to start even if DB fails
    }
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🔍 Debug routes: http://localhost:${PORT}/debug/routes`);
      console.log(`🤖 AI Test: http://localhost:${PORT}/api/ai/test`);
      console.log('='.repeat(50));
    });

    // Handle server errors gracefully
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

startServer();
