const pool = require('../config/database');
const https = require('https');
const http = require('http');

// Helper function to convert image URL or base64 to PNG buffer
async function convertImageToPNG(imageUrl) {
  try {
    // Check if it's a base64 data URI
    if (imageUrl.startsWith('data:image')) {
      // Extract base64 data and mime type
      const matches = imageUrl.match(/^data:image\/([^;]+);base64,(.+)$/);
      if (!matches) {
        // Try without explicit mime type
        const base64Data = imageUrl.split(',')[1] || imageUrl;
        const buffer = Buffer.from(base64Data, 'base64');
        return buffer;
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // If it's already PNG, return as is
      if (mimeType === 'png') {
        return buffer;
      }
      
      // For other formats, we'll return the buffer as is (could convert to PNG with sharp if needed)
      // For now, we'll store whatever format we get
      console.log(`📸 Image format detected: ${mimeType}, converting to buffer`);
      return buffer;
    }
    
    // If it's a URL, fetch it and convert to buffer
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(imageUrl);
        const protocol = url.protocol === 'https:' ? https : http;
        
        protocol.get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to fetch image: ${response.statusCode}`));
            return;
          }
          
          const contentType = response.headers['content-type'] || '';
          console.log(`📸 Fetching image from URL, content-type: ${contentType}`);
          
          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer);
          });
          response.on('error', reject);
        }).on('error', reject);
      } catch (urlError) {
        reject(new Error(`Invalid URL: ${urlError.message}`));
      }
    });
  } catch (error) {
    console.error('Error converting image to PNG:', error);
    throw error;
  }
}

// Helper function to extract dress type and gender from clothingType
function extractDressTypeAndGender(clothingType) {
  if (!clothingType) {
    return { dressType: 'unknown', gender: 'unknown' };
  }
  
  // Remove male/female prefix
  const dressType = clothingType.replace(/^(male|female|unisex)-/i, '');
  
  // Extract gender
  let gender = 'unisex';
  if (clothingType.toLowerCase().startsWith('male-') || clothingType.toLowerCase().startsWith('men-')) {
    gender = 'male';
  } else if (clothingType.toLowerCase().startsWith('female-') || clothingType.toLowerCase().startsWith('women-')) {
    gender = 'female';
  }
  
  return { dressType, gender };
}

class OrderService {

  static async createOrder(orderData, userId, userEmail) {
    try {
      console.log('📝 Creating order for user:', userId);
      console.log('📝 Order data:', JSON.stringify(orderData, null, 2));
      
      const result = await pool.query(
        'INSERT INTO orders (user_id, order_data, status, total_amount) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, JSON.stringify(orderData), 'pending', orderData.total]
      );

      const orderId = result.rows[0].id;
      console.log('✅ Created order:', orderId);

      // Save detailed order information for admin use
      if (orderData.items && orderData.items.length > 0) {
        await this.saveOrderDetails(orderId, orderData);
      }

      return orderId.toString();
    } catch (error) {
      console.error('❌ Error creating order:', error.message);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  static async saveOrderDetails(orderId, orderData) {
    try {
      console.log('💾 Saving order details for order:', orderId);
      
      const items = orderData.items || [];
      const shippingAddress = orderData.shippingAddress || {};
      
      // Format address
      const addressParts = [
        shippingAddress.fullName,
        shippingAddress.address,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.zipCode,
        shippingAddress.country
      ].filter(Boolean);
      const formattedAddress = addressParts.join(', ') || 'Address not provided';

      // Process each item in the order
      for (const item of items) {
        // Extract dress type and gender from clothingType or category
        let clothingType = item.clothingType || '';
        
        // If category is separate, use it for gender
        let gender = 'unisex';
        if (item.category) {
          gender = item.category.toLowerCase();
        } else {
          // Extract from clothingType
          const extracted = extractDressTypeAndGender(clothingType);
          gender = extracted.gender;
        }
        
        const { dressType } = extractDressTypeAndGender(clothingType);
        
        // Convert image to PNG buffer
        let imageBuffer;
        try {
          if (!item.imageUrl) {
            throw new Error('No image URL provided');
          }
          
          console.log(`📸 Converting image for item: ${item.name || item.id}`);
          console.log(`📸 Image URL type: ${item.imageUrl.startsWith('data:') ? 'base64' : 'URL'}`);
          
          imageBuffer = await convertImageToPNG(item.imageUrl);
          console.log(`✅ Converted image to PNG for item: ${item.name || item.id}, size: ${imageBuffer.length} bytes`);
        } catch (imageError) {
          console.error('❌ Error converting image:', imageError.message);
          // Create a placeholder buffer if image conversion fails
          imageBuffer = Buffer.from('placeholder');
        }

        // Insert into order_details table
        await pool.query(
          `INSERT INTO order_details 
           (order_id, dress_type, gender, size, quantity, address, ai_image, image_format, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
          [
            orderId,
            dressType,
            gender,
            item.size || 'N/A',
            item.quantity || 1,
            formattedAddress,
            imageBuffer,
            'png'
          ]
        );

        console.log(`✅ Saved order detail for item: ${item.name || item.id}`);
      }

      console.log('✅ All order details saved successfully');
    } catch (error) {
      console.error('❌ Error saving order details:', error.message);
      // Don't throw error - we don't want to fail the order creation if details save fails
      console.error('Order creation will continue despite details save failure');
    }
  }

  static async getOrderById(orderId) {
    try {
      const result = await pool.query(
        'SELECT * FROM orders WHERE id = $1',
        [orderId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        userId: row.user_id,
        orderData: row.order_data,
        status: row.status,
        totalAmount: row.total_amount,
        razorpayOrderId: row.razorpay_order_id,
        paymentId: row.payment_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  static async getUserOrders(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        userId: row.user_id,
        orderData: row.order_data,
        status: row.status,
        totalAmount: row.total_amount,
        razorpayOrderId: row.razorpay_order_id,
        paymentId: row.payment_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  static async getAllOrders() {
    try {
      const result = await pool.query(
        'SELECT * FROM orders ORDER BY created_at DESC'
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        userId: row.user_id,
        orderData: row.order_data,
        status: row.status,
        totalAmount: row.total_amount,
        razorpayOrderId: row.razorpay_order_id,
        paymentId: row.payment_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }

  static async getOrdersByStatus(status) {
    try {
      const result = await pool.query(
        'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC',
        [status]
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        userId: row.user_id,
        orderData: row.order_data,
        status: row.status,
        totalAmount: row.total_amount,
        razorpayOrderId: row.razorpay_order_id,
        paymentId: row.payment_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }
  }

  static async saveOrderForLater(orderData, userId, userEmail) {
    try {
      console.log('💾 Saving order for later - User:', userId);
      
      const result = await pool.query(
        'INSERT INTO saved_orders (user_id, order_data) VALUES ($1, $2) RETURNING id',
        [userId, JSON.stringify(orderData)]
      );

      console.log('✅ Saved order:', result.rows[0].id);
      return result.rows[0].id.toString();
    } catch (error) {
      console.error('❌ Error saving order for later:', error.message);
      throw new Error(`Failed to save order: ${error.message}`);
    }
  }

  static async getSavedOrderById(savedOrderId) {
    try {
      const result = await pool.query(
        'SELECT * FROM saved_orders WHERE id = $1',
        [savedOrderId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        userId: row.user_id,
        orderData: row.order_data,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error('Error fetching saved order:', error);
      throw error;
    }
  }

  static async getSavedOrders(userId) {
    try {
      console.log('📥 Fetching saved orders for user:', userId);
      
      const result = await pool.query(
        'SELECT * FROM saved_orders WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      console.log(`✅ Found ${result.rows.length} saved orders`);
      return result.rows.map(row => ({
        id: row.id.toString(),
        userId: row.user_id,
        orderData: row.order_data,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('❌ Error fetching saved orders:', error.message);
      throw new Error(`Failed to fetch saved orders: ${error.message}`);
    }
  }

  static async deleteSavedOrder(savedOrderId) {
    try {
      const result = await pool.query(
        'DELETE FROM saved_orders WHERE id = $1 RETURNING id',
        [savedOrderId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting saved order:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId, status, trackingNumber) {
    try {
      let query = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP';
      const params = [status];

      if (trackingNumber) {
        query += ', tracking_number = $2';
        params.push(trackingNumber);
      }

      query += ' WHERE id = $' + (params.length + 1);
      params.push(orderId);

      await pool.query(query, params);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Get order details for admin use
  static async getOrderDetails(orderId) {
    try {
      const result = await pool.query(
        `SELECT 
          od.id,
          od.order_id,
          od.dress_type,
          od.gender,
          od.size,
          od.quantity,
          od.address,
          od.ai_image,
          od.image_format,
          od.created_at,
          o.status as order_status,
          o.total_amount
        FROM order_details od
        JOIN orders o ON od.order_id = o.id
        WHERE od.order_id = $1
        ORDER BY od.created_at DESC`,
        [orderId]
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        orderId: row.order_id.toString(),
        dressType: row.dress_type,
        gender: row.gender,
        size: row.size,
        quantity: row.quantity,
        address: row.address,
        imageFormat: row.image_format,
        createdAt: row.created_at,
        orderStatus: row.order_status,
        totalAmount: row.total_amount,
        // Note: ai_image is a Buffer, convert to base64 if needed
        hasImage: row.ai_image ? true : false,
        imageSize: row.ai_image ? row.ai_image.length : 0
      }));
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Get all order details for admin (with pagination)
  static async getAllOrderDetails(limit = 100, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT 
          od.id,
          od.order_id,
          od.dress_type,
          od.gender,
          od.size,
          od.quantity,
          od.address,
          od.image_format,
          od.created_at,
          o.status as order_status,
          o.total_amount,
          o.user_id
        FROM order_details od
        JOIN orders o ON od.order_id = o.id
        ORDER BY od.created_at DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        orderId: row.order_id.toString(),
        dressType: row.dress_type,
        gender: row.gender,
        size: row.size,
        quantity: row.quantity,
        address: row.address,
        imageFormat: row.image_format,
        createdAt: row.created_at,
        orderStatus: row.order_status,
        totalAmount: row.total_amount,
        userId: row.user_id
      }));
    } catch (error) {
      console.error('Error fetching all order details:', error);
      throw error;
    }
  }

  // Get order detail image as base64
  static async getOrderDetailImage(detailId) {
    try {
      const result = await pool.query(
        'SELECT ai_image, image_format FROM order_details WHERE id = $1',
        [detailId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      if (!row.ai_image) {
        return null;
      }

      // Convert buffer to base64
      const base64Image = row.ai_image.toString('base64');
      const mimeType = row.image_format === 'png' ? 'image/png' : 'image/jpeg';
      
      return {
        base64: `data:${mimeType};base64,${base64Image}`,
        format: row.image_format
      };
    } catch (error) {
      console.error('Error fetching order detail image:', error);
      throw error;
    }
  }
}

module.exports = { OrderService };
