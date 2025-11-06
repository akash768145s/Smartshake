// Vendor App Types
export interface Flavour {
  id: string;
  name: string;
  icon: string;
  price_per_scoop: number;
  available: boolean;
  created_at: Date;
}

export interface Order {
  id: string;
  base: 'milk' | 'water';
  quantity: number;
  total_price: number;
  status: 'pending' | 'preparing' | 'dispensing' | 'completed' | 'failed';
  created_at: Date;
  completed_at?: Date;
  machineId?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  flavour_id: string;
  scoops: number;
  price_per_scoop: number;
  created_at: Date;
}

// Admin Dashboard Types
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
  lastClean: Date;
  lastPing: Date;
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
  timestamp: Date;
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
  timestamp: Date;
  status: 'open' | 'muted' | 'resolved';
  occurrences: number;
}

