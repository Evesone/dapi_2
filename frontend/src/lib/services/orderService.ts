import { Order, CreateOrderRequest, SavedOrder } from '@/lib/types/order';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class OrderService {
  // Create a new order
  static async createOrder(orderData: CreateOrderRequest, userId: string, userEmail: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          userId,
          userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      return result.orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get order');
      }

      const result = await response.json();
      return result.order;
    } catch (error) {
      console.error('Error getting order:', error);
      throw new Error('Failed to get order');
    }
  }

  // Get all orders for a user
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to get user orders');
      }

      const result = await response.json();
      return result.orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw new Error('Failed to get user orders');
    }
  }

  // Get all orders (for admin)
  static async getAllOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);

      if (!response.ok) {
        throw new Error('Failed to get all orders');
      }

      const result = await response.json();
      return result.orders;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw new Error('Failed to get all orders');
    }
  }

  // Get orders by status (for production team)
  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders?status=${status}`);

      if (!response.ok) {
        throw new Error('Failed to get orders by status');
      }

      const result = await response.json();
      return result.orders;
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw new Error('Failed to get orders by status');
    }
  }

  // Save order to saved orders collection
  static async saveOrderForLater(orderData: CreateOrderRequest, userId: string, userEmail: string, originalOrderId?: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/save-for-later`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData: {
            ...orderData,
            originalOrderId,
          },
          userId,
          userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save order for later');
      }

      const result = await response.json();
      return result.savedOrderId;
    } catch (error) {
      console.error('Error saving order for later:', error);
      throw new Error('Failed to save order for later');
    }
  }

  // Get saved orders for a user
  static async getSavedOrders(userId: string): Promise<SavedOrder[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders?type=saved&userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to get saved orders');
      }

      const result = await response.json();
      return result.savedOrders;
    } catch (error) {
      console.error('Error getting saved orders:', error);
      throw new Error('Failed to get saved orders');
    }
  }

  // Get saved order by ID
  static async getSavedOrderById(savedOrderId: string): Promise<SavedOrder | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/saved/${savedOrderId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get saved order');
      }

      const result = await response.json();
      return result.savedOrder;
    } catch (error) {
      console.error('Error getting saved order:', error);
      throw new Error('Failed to get saved order');
    }
  }

  // Delete saved order (this would need to be implemented in the backend)
  static async deleteSavedOrder(savedOrderId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/saved/${savedOrderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete saved order');
      }
    } catch (error) {
      console.error('Error deleting saved order:', error);
      throw new Error('Failed to delete saved order');
    }
  }

  // Update order status (this would need to be implemented in the backend)
  static async updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          trackingNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }
}