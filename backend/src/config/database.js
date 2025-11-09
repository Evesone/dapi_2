const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        // Option 1: Use DATABASE_URL (recommended for Render)
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false // Required for Render PostgreSQL
        }
      }
    : {
        // Option 2: Use individual database variables
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false // Required for Render PostgreSQL
        } : false
      }
);

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Function to test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection test successful');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Please check your DATABASE_URL in .env file');
    return false;
  }
}

// Create tables if they don't exist
const createTables = async () => {
  try {
    console.log('📊 Creating database tables...');
    
    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        order_data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        razorpay_order_id VARCHAR(255),
        payment_id VARCHAR(255),
        tracking_number VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Orders table ready');

    // Saved orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_orders (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        order_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Saved orders table ready');

    // Promo codes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        user_email VARCHAR(255),
        max_uses INTEGER DEFAULT NULL,
        current_uses INTEGER DEFAULT 0,
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP DEFAULT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Promo codes table ready');

    // Order details table for admin use
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_details (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        dress_type VARCHAR(255) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        size VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        address TEXT NOT NULL,
        ai_image BYTEA NOT NULL,
        image_format VARCHAR(10) DEFAULT 'png',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Order details table ready');
    console.log('✅ Database tables created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    return false;
  }
};

// Initialize database
const initializeDatabase = async () => {
  console.log('🔄 Initializing database...');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Failed to connect to database. Please check your configuration.');
    console.error('Make sure DATABASE_URL is set in your environment variables.');
    return false;
  }
  
  const tablesCreated = await createTables();
  if (!tablesCreated) {
    console.error('❌ Failed to create database tables.');
    return false;
  }
  
  console.log('✅ Database initialized successfully');
  return true;
};

// Export both pool and initialization function
module.exports = pool;
module.exports.initializeDatabase = initializeDatabase;
