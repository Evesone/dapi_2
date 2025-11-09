const express = require('express');
const router = express.Router();
const { OrderService } = require('../services/orderService');

// Create order
router.post('/', async (req, res) => {
  try {
    const { orderData, userId, userEmail } = req.body;

    if (!orderData || !userId || !userEmail) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const orderId = await OrderService.createOrder(orderData, userId, userEmail);
    
    return res.status(201).json({
      success: true,
      orderId,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Check if it's a database connection error
    if (error.message.includes('database') || error.message.includes('connection')) {
      return res.status(503).json({
        error: 'Database service unavailable. Please check server configuration.',
        details: 'Database connection error'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to create order'
    });
  }
});

// Get orders
router.get('/', async (req, res) => {
  try {
    const { userId, status, type } = req.query;

    if (type === 'saved' && userId) {
      const savedOrders = await OrderService.getSavedOrders(userId);
      return res.json({ savedOrders });
    }

    let orders;

    if (status) {
      orders = await OrderService.getOrdersByStatus(status);
    } else if (userId) {
      orders = await OrderService.getUserOrders(userId);
    } else {
      orders = await OrderService.getAllOrders();
    }

    return res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    // Check if it's a Firebase initialization error
    if (error.message.includes('Firebase not initialized')) {
      return res.status(503).json({
        error: 'Database service unavailable. Please check server configuration.',
        details: 'Firebase not initialized',
        orders: [] // Return empty array for orders
      });
    }
    
    return res.status(500).json({
      error: 'Failed to fetch orders'
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    return res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    
    // Check if it's a database connection error
    if (error.message.includes('database') || error.message.includes('connection')) {
      return res.status(503).json({
        error: 'Database service unavailable. Please check server configuration.',
        details: 'Database connection error'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to fetch order'
    });
  }
});

// Save order for later
router.post('/save-for-later', async (req, res) => {
  try {
    const { orderData, userId, userEmail } = req.body;

    if (!orderData || !userId || !userEmail) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const savedOrderId = await OrderService.saveOrderForLater(orderData, userId, userEmail);
    
    return res.status(201).json({
      success: true,
      savedOrderId,
      message: 'Order saved for later successfully'
    });
  } catch (error) {
    console.error('Error saving order for later:', error);
    
    // Check if it's a database connection error
    if (error.message.includes('database') || error.message.includes('connection')) {
      return res.status(503).json({
        error: 'Database service unavailable. Please check server configuration.',
        details: 'Database connection error'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to save order for later'
    });
  }
});

// Get saved order by ID
router.get('/saved/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const savedOrder = await OrderService.getSavedOrderById(id);
    
    if (!savedOrder) {
      return res.status(404).json({
        error: 'Saved order not found'
      });
    }

    return res.json({ savedOrder });
  } catch (error) {
    console.error('Error fetching saved order:', error);
    
    // Check if it's a database connection error
    if (error.message.includes('database') || error.message.includes('connection')) {
      return res.status(503).json({
        error: 'Database service unavailable. Please check server configuration.',
        details: 'Database connection error'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to fetch saved order'
    });
  }
});

// Delete saved order
router.delete('/saved/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await OrderService.deleteSavedOrder(id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Saved order not found'
      });
    }

    return res.json({ 
      success: true,
      message: 'Saved order deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting saved order:', error);
    
    // Check if it's a database connection error
    if (error.message.includes('database') || error.message.includes('connection')) {
      return res.status(503).json({
        error: 'Database service unavailable. Please check server configuration.',
        details: 'Database connection error'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to delete saved order'
    });
  }
});

// Update order status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    
    await OrderService.updateOrderStatus(id, status, trackingNumber);
    
    return res.json({ 
      success: true,
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    
    // Check if it's a database connection error
    if (error.message.includes('database') || error.message.includes('connection')) {
      return res.status(503).json({
        error: 'Database service unavailable. Please check server configuration.',
        details: 'Database connection error'
      });
    }
    
    return res.status(500).json({
      error: 'Failed to update order status'
    });
  }
});

module.exports = router;
