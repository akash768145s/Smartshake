const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Flavour {
  id: string;
  name: string;
  icon: string;
  price_per_scoop: number;
  available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  base: 'milk' | 'water';
  quantity: number;
  total_price: number;
  status: 'pending' | 'preparing' | 'dispensing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  machineId?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  flavour_id: string;
  scoops: number;
  price_per_scoop: number;
  created_at: string;
}

export interface CreateOrderRequest {
  base: 'milk' | 'water';
  quantity: number;
  total_price: number;
  flavours: Record<string, number>; // flavourId -> scoops
  machineId?: string;
  machineName?: string;
  idempotencyKey?: string;
}

export interface Machine {
  id: string;
  name: string;
  location: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  key_id: string;
}

export interface PaymentVerification {
  verified: boolean;
  order_id?: string;
  payment_id?: string;
  error?: string;
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Flavours
  async getFlavours(): Promise<Flavour[]> {
    return this.request<Flavour[]>('/flavours');
  }

  async getFlavour(id: string): Promise<Flavour> {
    return this.request<Flavour>(`/flavours/${id}`);
  }

  // Orders
  async createOrder(data: CreateOrderRequest): Promise<{ order: Order; orderItems: OrderItem[] }> {
    return this.request<{ order: Order; orderItems: OrderItem[] }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrder(id: string): Promise<{ order: Order; orderItems: OrderItem[] }> {
    return this.request<{ order: Order; orderItems: OrderItem[] }>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Machines
  async getMachines(): Promise<Machine[]> {
    return this.request<Machine[]>('/machines');
  }

  // Payments
  async createPaymentOrder(data: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayOrder> {
    return this.request<RazorpayOrder>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<PaymentVerification> {
    return this.request<PaymentVerification>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();

