const pool = require('../config/database');
const { randomUUID } = require('crypto');
const https = require('https');
const http = require('http');
const sharp = require('sharp');

// Helper function to fetch image from URL
async function fetchImageFromUrl(imageUrl) {
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
}

// Helper function to convert image URL or base64 to optimized PNG buffer (300 DPI, <20MB)
async function convertImageToPNG(imageUrl) {
  try {
    let inputBuffer;
    
    // Check if it's a base64 data URI
    if (imageUrl.startsWith('data:image')) {
      // Extract base64 data and mime type
      const matches = imageUrl.match(/^data:image\/([^;]+);base64,(.+)$/);
      if (!matches) {
        // Try without explicit mime type
        const base64Data = imageUrl.split(',')[1] || imageUrl;
        inputBuffer = Buffer.from(base64Data, 'base64');
      } else {
        const base64Data = matches[2];
        inputBuffer = Buffer.from(base64Data, 'base64');
      }
      console.log(`📸 Image format: base64, size: ${(inputBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    } else {
      // If it's a URL, fetch it
      inputBuffer = await fetchImageFromUrl(imageUrl);
      console.log(`📸 Image fetched from URL, size: ${(inputBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    console.log(`📸 Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${(inputBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Calculate target dimensions to ensure <20MB at 300 DPI
    // PNG at 300 DPI: roughly 4 bytes per pixel (RGBA)
    // 20MB = 20 * 1024 * 1024 bytes = 20,971,520 bytes
    // Max pixels = 20,971,520 / 4 = 5,242,880 pixels
    // For a square image: sqrt(5,242,880) ≈ 2289 pixels
    // We'll use a more conservative limit and allow some compression
    
    const maxPixels = 5000000; // ~5M pixels for safety margin
    const currentPixels = metadata.width * metadata.height;
    
    let sharpInstance = sharp(inputBuffer);
    
    // Resize if image is too large
    if (currentPixels > maxPixels) {
      const scale = Math.sqrt(maxPixels / currentPixels);
      const newWidth = Math.round(metadata.width * scale);
      const newHeight = Math.round(metadata.height * scale);
      console.log(`📸 Resizing image from ${metadata.width}x${metadata.height} to ${newWidth}x${newHeight}`);
      sharpInstance = sharpInstance.resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Process image: convert to PNG, set 300 DPI, optimize compression
    let outputBuffer = await sharpInstance
      .png({
        compressionLevel: 9, // Maximum compression (0-9)
        adaptiveFiltering: true,
        palette: false // Use full color
      })
      .withMetadata({
        density: 300 // Set DPI to 300
      })
      .toBuffer();
    
    const outputSizeMB = outputBuffer.length / 1024 / 1024;
    console.log(`📸 Processed image size: ${outputSizeMB.toFixed(2)} MB`);
    
    // If still too large, apply more aggressive compression
    if (outputSizeMB > 20) {
      console.log(`⚠️ Image still too large (${outputSizeMB.toFixed(2)} MB), applying aggressive compression...`);
      
      // Reduce quality and resize further if needed
      const targetSizeBytes = 20 * 1024 * 1024; // 20MB
      const currentSizeBytes = outputBuffer.length;
      const compressionRatio = targetSizeBytes / currentSizeBytes;
      
      // Get current dimensions
      const processedMetadata = await sharp(outputBuffer).metadata();
      const newWidth = Math.round(processedMetadata.width * Math.sqrt(compressionRatio * 0.9));
      const newHeight = Math.round(processedMetadata.height * Math.sqrt(compressionRatio * 0.9));
      
      console.log(`📸 Further resizing to ${newWidth}x${newHeight}`);
      
      outputBuffer = await sharp(inputBuffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({
          compressionLevel: 9, // Maximum compression
          adaptiveFiltering: true
        })
        .withMetadata({
          density: 300
        })
        .toBuffer();
      
      const finalSizeMB = outputBuffer.length / 1024 / 1024;
      console.log(`📸 Final processed image size: ${finalSizeMB.toFixed(2)} MB`);
      
      if (finalSizeMB > 20) {
        console.warn(`⚠️ Warning: Image size (${finalSizeMB.toFixed(2)} MB) still exceeds 20MB limit`);
      }
    }
    
    // Verify final image
    const finalMetadata = await sharp(outputBuffer).metadata();
    console.log(`✅ Final image: ${finalMetadata.width}x${finalMetadata.height}, format: PNG, DPI: 300, size: ${(outputBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    return outputBuffer;
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
        
        const imageUrl = typeof item.imageUrl === 'string' ? item.imageUrl : null;
        
        // Insert into order_details table (store only image URL)
        await pool.query(
          `INSERT INTO order_details 
           (order_id, dress_type, gender, size, quantity, address, ai_image, ai_image_url, image_format, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
          [
            orderId,
            dressType,
            gender,
            item.size || 'N/A',
            item.quantity || 1,
            formattedAddress,
            null,
            imageUrl,
            'png' // Always PNG format
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
      console.log('💾 Order data:', JSON.stringify(orderData, null, 2));
      
      // Generate a unique reference for this saved order (grouping multiple items)
      const saveReference = `saved_${userId}_${Date.now()}`;
      
      const items = orderData.items || [];
      const shippingAddress = orderData.shippingAddress || {};
      const paymentInfo = orderData.paymentInfo || {};
      
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
      
      const savedDetailIds = [];
      
      // Process each item in the saved order
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
        
        const imageUrl = typeof item.imageUrl === 'string' ? item.imageUrl : null;
        
        // Insert into saved_orders table (store only image URL)
        const result = await pool.query(
          `INSERT INTO saved_orders 
           (save_reference, user_id, user_email, dress_type, gender, size, quantity, address, 
            ai_image, ai_image_url, image_format, item_name, item_price, item_data, shipping_address, 
            payment_info, totals, order_snapshot, notes, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP) 
           RETURNING id`,
          [
            saveReference,
            userId,
            userEmail || null,
            dressType,
            gender,
            item.size || 'N/A',
            item.quantity || 1,
            formattedAddress,
            null,
            imageUrl,
            'png', // Always PNG format
            item.name || 'Custom Design',
            item.price || 0,
            JSON.stringify(item), // Store full item data
            JSON.stringify(shippingAddress), // Store shipping address
            JSON.stringify(paymentInfo), // Store payment info
            JSON.stringify({
              subtotal: orderData.subtotal || 0,
              tax: orderData.tax || 0,
              shipping: orderData.shipping || 0,
              total: orderData.total || 0
            }), // Store totals
            JSON.stringify(orderData), // Store complete order snapshot
            orderData.notes || null
          ]
        );
        
        savedDetailIds.push(result.rows[0].id.toString());
        console.log(`✅ Saved order detail for item: ${item.name || item.id}`);
      }
      
      console.log(`✅ All saved order details saved successfully (${savedDetailIds.length} items)`);
      // Return the save reference so items can be grouped together
      return saveReference;
    } catch (error) {
      console.error('❌ Error saving order for later:', error.message);
      throw new Error(`Failed to save order: ${error.message}`);
    }
  }

  static async getSavedOrderById(savedOrderId) {
    try {
      const result = await pool.query(
        `SELECT 
          id, save_reference, user_id, user_email, dress_type, gender, size, quantity, 
          address, ai_image_url, image_format, item_name, item_price, item_data, shipping_address, 
          payment_info, totals, order_snapshot, notes, created_at,
          COALESCE(LENGTH(ai_image), 0) as image_size_bytes
        FROM saved_orders WHERE id = $1`,
        [savedOrderId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        saveReference: row.save_reference,
        userId: row.user_id,
        userEmail: row.user_email,
        dressType: row.dress_type,
        gender: row.gender,
        size: row.size,
        quantity: row.quantity,
        address: row.address,
        imageFormat: row.image_format,
        imageUrl: row.ai_image_url,
        itemName: row.item_name,
        itemPrice: row.item_price,
        itemData: row.item_data,
        shippingAddress: row.shipping_address,
        paymentInfo: row.payment_info,
        totals: row.totals,
        orderSnapshot: row.order_snapshot,
        notes: row.notes,
        hasImage: !!row.ai_image_url,
        imageSize: row.image_size_bytes,
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
        `SELECT 
          id, save_reference, user_id, user_email, dress_type, gender, size, quantity, 
          address, ai_image_url, image_format, item_name, item_price, item_data, shipping_address, 
          payment_info, totals, order_snapshot, notes, created_at,
          COALESCE(LENGTH(ai_image), 0) as image_size_bytes
        FROM saved_orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );

      console.log(`✅ Found ${result.rows.length} saved orders`);
      return result.rows.map(row => ({
        id: row.id.toString(),
        saveReference: row.save_reference,
        userId: row.user_id,
        userEmail: row.user_email,
        dressType: row.dress_type,
        gender: row.gender,
        size: row.size,
        quantity: row.quantity,
        address: row.address,
        imageFormat: row.image_format,
        imageUrl: row.ai_image_url,
        itemName: row.item_name,
        itemPrice: row.item_price,
        itemData: row.item_data,
        shippingAddress: row.shipping_address,
        paymentInfo: row.payment_info,
        totals: row.totals,
        orderSnapshot: row.order_snapshot,
        notes: row.notes,
        hasImage: !!row.ai_image_url,
        imageSize: row.image_size_bytes,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('❌ Error fetching saved orders:', error.message);
      throw new Error(`Failed to fetch saved orders: ${error.message}`);
    }
  }

  // Get saved order details grouped by save_reference
  static async getSavedOrdersByReference(saveReference) {
    try {
      const result = await pool.query(
        `SELECT 
          id, save_reference, user_id, user_email, dress_type, gender, size, quantity, 
          address, ai_image_url, image_format, item_name, item_price, item_data, shipping_address, 
          payment_info, totals, order_snapshot, notes, created_at,
          COALESCE(LENGTH(ai_image), 0) as image_size_bytes
        FROM saved_orders WHERE save_reference = $1 ORDER BY created_at DESC`,
        [saveReference]
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        saveReference: row.save_reference,
        userId: row.user_id,
        userEmail: row.user_email,
        dressType: row.dress_type,
        gender: row.gender,
        size: row.size,
        quantity: row.quantity,
        address: row.address,
        imageFormat: row.image_format,
        imageUrl: row.ai_image_url,
        itemName: row.item_name,
        itemPrice: row.item_price,
        itemData: row.item_data,
        shippingAddress: row.shipping_address,
        paymentInfo: row.payment_info,
        totals: row.totals,
        orderSnapshot: row.order_snapshot,
        notes: row.notes,
        hasImage: !!row.ai_image_url,
        imageSize: row.image_size_bytes,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Error fetching saved orders by reference:', error);
      throw error;
    }
  }

  // Get saved order image as buffer (for direct download)
  static async getSavedOrderImageBuffer(savedOrderId) {
    try {
      const result = await pool.query(
        'SELECT ai_image, ai_image_url, image_format FROM saved_orders WHERE id = $1',
        [savedOrderId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      if (row.ai_image) {
        return {
          buffer: row.ai_image,
          format: 'png',
          size: row.ai_image.length
        };
      }

      if (row.ai_image_url) {
        const pngBuffer = await convertImageToPNG(row.ai_image_url);
        return {
          buffer: pngBuffer,
          format: 'png',
          size: pngBuffer.length
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching saved order image:', error);
      throw error;
    }
  }

  // Get saved order image as base64 (for API responses)
  static async getSavedOrderImage(savedOrderId) {
    try {
      const imageData = await this.getSavedOrderImageBuffer(savedOrderId);
      
      if (!imageData) {
        return null;
      }

      // Convert buffer to base64
      const base64Image = imageData.buffer.toString('base64');
      const mimeType = 'image/png'; // Always PNG
      
      return {
        base64: `data:${mimeType};base64,${base64Image}`,
        format: imageData.format,
        size: imageData.size
      };
    } catch (error) {
      console.error('Error fetching saved order image:', error);
      throw error;
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
          od.ai_image_url,
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
        imageUrl: row.ai_image_url,
        imageFormat: row.image_format,
        createdAt: row.created_at,
        orderStatus: row.order_status,
        totalAmount: row.total_amount,
        hasImage: !!row.ai_image_url,
        imageSize: 0
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
          od.ai_image_url,
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
        imageUrl: row.ai_image_url,
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

  // Get order detail image as buffer (for direct download)
  static async getOrderDetailImageBuffer(detailId) {
    try {
      const result = await pool.query(
        'SELECT ai_image, ai_image_url, image_format FROM order_details WHERE id = $1',
        [detailId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      if (row.ai_image) {
        return {
          buffer: row.ai_image,
          format: 'png',
          size: row.ai_image.length
        };
      }

      if (row.ai_image_url) {
        const pngBuffer = await convertImageToPNG(row.ai_image_url);
        return {
          buffer: pngBuffer,
          format: 'png',
          size: pngBuffer.length
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching order detail image:', error);
      throw error;
    }
  }

  // Get order detail image as base64 (for API responses)
  static async getOrderDetailImage(detailId) {
    try {
      const imageData = await this.getOrderDetailImageBuffer(detailId);
      
      if (!imageData) {
        return null;
      }

      // Convert buffer to base64
      const base64Image = imageData.buffer.toString('base64');
      const mimeType = 'image/png'; // Always PNG
      
      return {
        base64: `data:${mimeType};base64,${base64Image}`,
        format: imageData.format,
        size: imageData.size
      };
    } catch (error) {
      console.error('Error fetching order detail image:', error);
      throw error;
    }
  }
}

module.exports = { OrderService };
