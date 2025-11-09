import { loadScript } from './utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
  };
  handler?: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export class RazorpayService {
  private static instance: RazorpayService;
  private isLoaded = false;

  private constructor() {}

  static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  async loadRazorpay(): Promise<void> {
    if (this.isLoaded) return;

    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load Razorpay:', error);
      throw new Error('Failed to load payment gateway');
    }
  }

  async createOrder(amount: number, currency: string = 'INR'): Promise<string> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paise
          currency,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      return data.orderId;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async openPayment(options: Omit<RazorpayOptions, 'key'>): Promise<any> {
    await this.loadRazorpay();

    return new Promise((resolve, reject) => {
      const razorpayOptions: RazorpayOptions = {
        ...options,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        handler: (response: any) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled'));
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    });
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/razorpay/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          orderId,
          signature,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data.verified;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
}

export const razorpayService = RazorpayService.getInstance();
