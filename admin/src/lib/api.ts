const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Machine {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'warning' | 'critical' | 'offline';
  uptime7d: number;
  dispenses24h: number;
  milkLevel: number;
  waterLevel: number;
  powderLevels: Record<string, number>;
  lastClean: string;
  lastPing: string;
  revenue24h: number;
}

export interface Sale {
  id: string;
  machineId: string;
  machineName: string;
  flavours: Array<{ name: string; scoops: number }>;
  quantity: number;
  total: number;
  base: 'milk' | 'water';
  timestamp: string;
  duration: number;
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  category: 'payment' | 'dispense' | 'sensors' | 'cleaning' | 'network';
  timestamp: string;
  status: 'open' | 'muted' | 'resolved';
  occurrences: number;
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

  // Machines
  async getMachines(): Promise<Machine[]> {
    return this.request<Machine[]>('/machines');
  }

  async getMachine(id: string): Promise<Machine> {
    return this.request<Machine>(`/machines/${id}`);
  }

  async updateMachine(id: string, data: Partial<Machine>): Promise<Machine> {
    return this.request<Machine>(`/machines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Sales
  async getSales(params?: {
    machineId?: string;
    days?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Sale[]> {
    const queryParams = new URLSearchParams();
    if (params?.machineId) queryParams.append('machineId', params.machineId);
    if (params?.days) queryParams.append('days', params.days.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.request<Sale[]>(`/sales${query ? `?${query}` : ''}`);
  }

  async getSalesStats(days?: number): Promise<{
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    period: string;
  }> {
    const query = days ? `?days=${days}` : '';
    return this.request(`/sales/stats${query}`);
  }

  // Alerts
  async getAlerts(params?: {
    machineId?: string;
    status?: string;
    severity?: string;
  }): Promise<Alert[]> {
    const queryParams = new URLSearchParams();
    if (params?.machineId) queryParams.append('machineId', params.machineId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.severity) queryParams.append('severity', params.severity);

    const query = queryParams.toString();
    return this.request<Alert[]>(`/alerts${query ? `?${query}` : ''}`);
  }

  async createAlert(data: Omit<Alert, 'id'>): Promise<Alert> {
    return this.request<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
    return this.request<Alert>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();

