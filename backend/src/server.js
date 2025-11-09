const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, health checks)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000', // Local development
      'https://dapi-clothes.vercel.app', // Your actual Vercel domain
      process.env.FRONTEND_URL, // Environment variable for frontend URL
      'https://dapi-clothes.onrender.com' // Render backend URL for internal requests
    ].filter(Boolean); // Remove any undefined values
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      // In production, be more permissive for now to avoid blocking legitimate requests
      if (process.env.NODE_ENV === 'production') {
        console.log('Allowing origin in production mode:', origin);
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server with database initialization
async function startServer() {
  try {
    console.log('🚀 Starting DAPI Backend Server...');
    
    // Initialize database
    await initializeDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🔍 Debug routes: http://localhost:${PORT}/debug/routes`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
