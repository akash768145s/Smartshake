import { useMemo, useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { FleetHealthCard } from "@/components/dashboard/FleetHealthCard";
import {
  IndianRupee,
  Zap,
  Activity,
  Server,
  Clock,
  Sparkles,
} from "lucide-react";
import { FLAVOURS } from "@/lib/mockData";
import { api, Machine, Sale, Alert } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function calculateKPIs(machines: Machine[], sales: Sale[], alerts: Alert[]) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const salesToday = sales.filter(s => new Date(s.timestamp).getTime() > oneDayAgo);
  const sales7d = sales.filter(s => new Date(s.timestamp).getTime() > sevenDaysAgo);

  const revenueToday = salesToday.reduce((sum, s) => sum + s.total, 0);
  const dispensesToday = salesToday.length;

  // Count demo machines from sales if machines collection is empty
  const demoMachineNames = ['MACHINE-001', 'MACHINE-002', 'MACHINE-003', 'MACHINE-004', 'MACHINE-005',
    'MACHINE-006', 'MACHINE-007', 'MACHINE-008', 'MACHINE-009', 'MACHINE-010'];
  const machinesFromSales = new Set(sales.map(s => s.machineName).filter(name => demoMachineNames.includes(name)));
  const totalMachines = machines.length > 0 ? machines.length : Math.max(10, machinesFromSales.size || 10);

  const activeMachines = machines.length > 0
    ? machines.filter(m => m.status === "online").length
    : totalMachines; // Assume all demo machines are online if machines collection is empty

  const avgUptime = machines.length > 0
    ? machines.reduce((sum, m) => sum + m.uptime7d, 0) / machines.length
    : 98.5; // Default uptime for demo machines

  const avgPrepTime = salesToday.length > 0
    ? salesToday.reduce((sum, s) => sum + s.duration, 0) / salesToday.length
    : 0;

  const machinesCleanedToday = machines.length > 0
    ? machines.filter(m => new Date(m.lastClean).getTime() > oneDayAgo).length
    : 0;
  const cleaningCompliance = totalMachines > 0
    ? (machinesCleanedToday / totalMachines) * 100
    : 0;

  return {
    revenueToday,
    dispensesToday,
    activeMachines,
    totalMachines,
    avgUptime: isNaN(avgUptime) ? 98.5 : avgUptime,
    avgPrepTime: isNaN(avgPrepTime) ? 0 : avgPrepTime,
    cleaningCompliance: isNaN(cleaningCompliance) ? 0 : cleaningCompliance,
    openAlerts: alerts.filter(a => a.status === "open").length,
  };
}

export default function Overview() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [machinesData, salesData, alertsData] = await Promise.all([
          api.getMachines(),
          api.getSales({ days: 14 }),
          api.getAlerts(),
        ]);
        setMachines(machinesData);
        setSales(salesData);
        setAlerts(alertsData);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        const errorMessage = error?.message || 'Failed to fetch data from backend';
        setError(errorMessage);
        // Set empty arrays on error so UI doesn't break
        setMachines([]);
        setSales([]);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const kpis = useMemo(() => calculateKPIs(machines, sales, alerts), [machines, sales, alerts]);

  // Sales by hour (today)
  const salesByHour = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const todaySales = sales.filter(s => new Date(s.timestamp).getTime() > oneDayAgo);

    const hourly = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      count: 0,
      revenue: 0,
    }));

    todaySales.forEach(sale => {
      const hour = new Date(sale.timestamp).getHours();
      hourly[hour].count++;
      hourly[hour].revenue += sale.total;
    });

    return hourly;
  }, [sales]);

  // Flavour distribution (7 days)
  const flavourDistribution = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentSales = sales.filter(s => new Date(s.timestamp).getTime() > sevenDaysAgo);

    const distribution: Record<string, number> = {};
    FLAVOURS.forEach(f => distribution[f.name] = 0);

    recentSales.forEach(sale => {
      sale.flavours.forEach(f => {
        distribution[f.name] += f.scoops;
      });
    });

    return FLAVOURS.map((f, i) => ({
      name: f.name,
      value: distribution[f.name],
      color: f.color,
    })).filter(f => f.value > 0);
  }, [sales]);

  // Generate 14-day sparkline for revenue
  const revenueSparkline = useMemo(() => {
    const dailyRevenue = Array.from({ length: 14 }, (_, i) => {
      const dayStart = Date.now() - (i * 24 * 60 * 60 * 1000);
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const daySales = sales.filter(
        s => {
          const saleTime = new Date(s.timestamp).getTime();
          return saleTime >= dayStart && saleTime < dayEnd;
        }
      );
      return daySales.reduce((sum, s) => sum + s.total, 0);
    });
    return dailyRevenue.reverse();
  }, [sales]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show message if no data and not loading
  const hasNoData = machines.length === 0 && sales.length === 0 && !loading;

  return (
    <div className="space-y-8">
      {error && (
        <div className="glass-card rounded-2xl p-6 border-l-4 border-destructive">
          <h3 className="text-lg font-semibold mb-2 text-destructive">Connection Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="text-sm space-y-2">
            <p>• Make sure backend server is running on port 3001</p>
            <p>• Check browser console (F12) for detailed errors</p>
            <p>• Verify API URL: <code className="bg-secondary px-2 py-1 rounded">{import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}</code></p>
          </div>
        </div>
      )}
      {hasNoData && !error && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="text-muted-foreground mb-2">
            <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm mb-4">
              No data found. Seed the database by running:
            </p>
            <code className="bg-secondary px-4 py-2 rounded block w-fit mx-auto mb-4">
              cd backend && npm run seed
            </code>
            <p className="text-sm text-muted-foreground">
              Or make sure Firestore database is created in Firebase Console
            </p>
          </div>
        </div>
      )}

      {/* Hero KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Today's Revenue"
          value={`₹${kpis.revenueToday.toLocaleString()}`}
          delta={{ value: 12.4, label: "vs yesterday", positive: true }}
          icon={<IndianRupee className="w-5 h-5" />}
          trend={revenueSparkline}
        />

        <KPICard
          title="Dispenses Today"
          value={kpis.dispensesToday}
          delta={{ value: 8.2, label: "vs yesterday", positive: true }}
          icon={<Zap className="w-5 h-5" />}
        />

        <KPICard
          title="Uptime (24h)"
          value={`${kpis.avgUptime.toFixed(1)}%`}
          delta={{ value: 0.3, label: "vs last week", positive: true }}
          icon={<Activity className="w-5 h-5" />}
        />

        <KPICard
          title="Active Machines"
          value={`${kpis.activeMachines} / ${kpis.totalMachines}`}
          icon={<Server className="w-5 h-5" />}
        />

        <KPICard
          title="Avg Prep Time"
          value={`${kpis.avgPrepTime.toFixed(0)}s`}
          delta={{ value: 2.1, label: "faster", positive: true }}
          icon={<Clock className="w-5 h-5" />}
        />

        <KPICard
          title="Cleaning Compliance"
          value={`${kpis.cleaningCompliance.toFixed(0)}%`}
          delta={{ value: 5.5, label: "vs last week", positive: true }}
          icon={<Sparkles className="w-5 h-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Hour */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">
            Sales by Hour (Today)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesByHour}>
              <XAxis
                dataKey="hour"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Flavour Mix */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">
            Flavour Mix (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={flavourDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {flavourDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {flavourDistribution.map((f) => (
              <div key={f.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
                <span className="text-sm text-foreground">{f.name}</span>
                <span className="text-sm text-muted-foreground">({f.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Health */}
      {machines.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold uppercase tracking-wide mb-4">
            Fleet Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map((machine) => (
              <FleetHealthCard
                key={machine.id}
                machine={machine}
                onClick={() => console.log("Open machine drawer:", machine.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {sales.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold uppercase tracking-wide mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {sales.slice(0, 8).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                    {sale.flavours.map(f => FLAVOURS.find(fl => fl.name === f.name)?.emoji).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {sale.machineName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sale.flavours.map(f => `${f.scoops}x ${f.name}`).join(", ")} • {sale.quantity}ml
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">₹{sale.total}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(sale.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
