// Mock data generator for Smartshake Admin Dashboard

export interface Machine {
  id: string;
  name: string;
  location: string;
  status: "online" | "warning" | "critical" | "offline";
  uptime7d: number;
  dispenses24h: number;
  milkLevel: number;
  waterLevel: number;
  powderLevels: Record<string, number>;
  lastClean: Date;
  lastPing: Date;
  revenue24h: number;
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  category: "payment" | "dispense" | "sensors" | "cleaning" | "network";
  timestamp: Date;
  status: "open" | "muted" | "resolved";
  occurrences: number;
}

export interface Sale {
  id: string;
  machineId: string;
  machineName: string;
  flavours: Array<{ name: string; scoops: number }>;
  quantity: number;
  total: number;
  base: "milk" | "water";
  timestamp: Date;
  duration: number;
}

export const LOCATIONS = [
  "Gold's Gym - Bandra",
  "Talwalkar's - Andheri",
  "Snap Fitness - Powai",
  "Cult Fit - Lower Parel",
  "The Gym - Worli",
  "Fitness First - Juhu",
];

export const FLAVOURS = [
  { name: "Chocolate", emoji: "🍫", color: "#8B4513" },
  { name: "Vanilla", emoji: "🍦", color: "#F5DEB3" },
  { name: "Strawberry", emoji: "🍓", color: "#FF69B4" },
  { name: "Banana", emoji: "🍌", color: "#FFE135" },
  { name: "Coffee", emoji: "☕", color: "#6F4E37" },
];

// Generate mock machines
export function generateMockMachines(): Machine[] {
  const machines: Machine[] = [];
  const statuses: Machine["status"][] = ["online", "online", "online", "online", "warning", "critical"];
  
  for (let i = 0; i < 12; i++) {
    const location = LOCATIONS[i % LOCATIONS.length];
    const machineNum = Math.floor(i / LOCATIONS.length) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    machines.push({
      id: `machine-${i + 1}`,
      name: `SV-${location.split(" ")[0].substring(0, 3).toUpperCase()}-${machineNum}`,
      location,
      status,
      uptime7d: status === "online" ? 98 + Math.random() * 2 : status === "warning" ? 85 + Math.random() * 10 : 60 + Math.random() * 20,
      dispenses24h: Math.floor(Math.random() * 100) + 50,
      milkLevel: status === "warning" ? 8 + Math.random() * 15 : 30 + Math.random() * 70,
      waterLevel: 40 + Math.random() * 60,
      powderLevels: {
        Chocolate: 30 + Math.random() * 70,
        Vanilla: 20 + Math.random() * 80,
        Strawberry: 25 + Math.random() * 75,
        Banana: 35 + Math.random() * 65,
        Coffee: 40 + Math.random() * 60,
      },
      lastClean: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000),
      lastPing: new Date(Date.now() - Math.random() * 120 * 1000),
      revenue24h: Math.floor((Math.random() * 5000) + 2000),
    });
  }
  
  return machines;
}

// Generate mock alerts
export function generateMockAlerts(machines: Machine[]): Alert[] {
  const alertTemplates = [
    { severity: "critical", title: "Pump Prime Timeout", category: "dispense", description: "Milk pump failed to prime within timeout period" },
    { severity: "high", title: "Stirrer Jam Detected", category: "dispense", description: "Stirrer motor drawing excessive current" },
    { severity: "high", title: "Cup Sensor Failure", category: "sensors", description: "Cup presence sensor not responding" },
    { severity: "medium", title: "Payment Module Timeout", category: "payment", description: "Payment gateway response delayed" },
    { severity: "medium", title: "Temperature Spike", category: "sensors", description: "Refrigeration temperature exceeded threshold" },
    { severity: "low", title: "Low Milk Level", category: "cleaning", description: "Milk tank below 15% capacity" },
    { severity: "low", title: "Network Latency", category: "network", description: "API response time elevated" },
  ] as const;
  
  const alerts: Alert[] = [];
  const problemMachines = machines.filter(m => m.status === "warning" || m.status === "critical");
  
  problemMachines.forEach((machine) => {
    const numAlerts = machine.status === "critical" ? 2 : 1;
    for (let i = 0; i < numAlerts; i++) {
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      alerts.push({
        id: `alert-${alerts.length + 1}`,
        machineId: machine.id,
        machineName: machine.name,
        severity: template.severity as Alert["severity"],
        title: template.title,
        description: template.description,
        category: template.category as Alert["category"],
        timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
        status: Math.random() > 0.7 ? "muted" : "open",
        occurrences: Math.floor(Math.random() * 5) + 1,
      });
    }
  });
  
  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate mock sales data
export function generateMockSales(machines: Machine[], days: number = 7): Sale[] {
  const sales: Sale[] = [];
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  
  for (let day = 0; day < days; day++) {
    const dayStart = now - (day * msPerDay);
    const salesPerDay = Math.floor(Math.random() * 50) + 100;
    
    for (let i = 0; i < salesPerDay; i++) {
      const machine = machines[Math.floor(Math.random() * machines.length)];
      const timestamp = new Date(dayStart - Math.random() * msPerDay);
      const hour = timestamp.getHours();
      
      // Peak hours: 6-8 AM and 6-9 PM
      if (hour < 6 || (hour > 9 && hour < 18) || hour > 21) {
        if (Math.random() > 0.3) continue;
      }
      
      const numFlavours = Math.random() > 0.6 ? 2 : 1;
      const selectedFlavours = [...FLAVOURS]
        .sort(() => Math.random() - 0.5)
        .slice(0, numFlavours)
        .map(f => ({
          name: f.name,
          scoops: Math.floor(Math.random() * 2) + 1,
        }));
      
      const totalScoops = selectedFlavours.reduce((sum, f) => sum + f.scoops, 0);
      const base: "milk" | "water" = Math.random() > 0.3 ? "milk" : "water";
      const quantity = 250 + (totalScoops - 1) * 50;
      const pricePerScoop = 40;
      const total = totalScoops * pricePerScoop;
      
      sales.push({
        id: `sale-${sales.length + 1}`,
        machineId: machine.id,
        machineName: machine.name,
        flavours: selectedFlavours,
        quantity,
        total,
        base,
        timestamp,
        duration: 15 + Math.floor(Math.random() * 20),
      });
    }
  }
  
  return sales.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Calculate KPIs
export function calculateKPIs(machines: Machine[], sales: Sale[], alerts: Alert[]) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  const salesToday = sales.filter(s => s.timestamp.getTime() > oneDayAgo);
  const sales7d = sales.filter(s => s.timestamp.getTime() > sevenDaysAgo);
  
  const revenueToday = salesToday.reduce((sum, s) => sum + s.total, 0);
  const dispensesToday = salesToday.length;
  
  const activeMachines = machines.filter(m => m.status === "online").length;
  const avgUptime = machines.reduce((sum, m) => sum + m.uptime7d, 0) / machines.length;
  
  const avgPrepTime = salesToday.length > 0
    ? salesToday.reduce((sum, s) => sum + s.duration, 0) / salesToday.length
    : 0;
  
  const machinesCleanedToday = machines.filter(
    m => m.lastClean.getTime() > oneDayAgo
  ).length;
  const cleaningCompliance = (machinesCleanedToday / machines.length) * 100;
  
  return {
    revenueToday,
    dispensesToday,
    activeMachines,
    totalMachines: machines.length,
    avgUptime,
    avgPrepTime,
    cleaningCompliance,
    openAlerts: alerts.filter(a => a.status === "open").length,
  };
}
