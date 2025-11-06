import { useMemo, useState, useEffect } from "react";
import { FLAVOURS } from "@/lib/mockData";
import { api, Machine, Sale } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { IndianRupee, TrendingUp, Zap, DollarSign, Download } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";

export default function Sales() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machinesData, salesData] = await Promise.all([
          api.getMachines(),
          api.getSales({ days: 30 }),
        ]);
        setMachines(machinesData);
        setSales(salesData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const dateRanges = {
    "1d": 1,
    "7d": 7,
    "30d": 30,
  };

  const filteredSales = useMemo(() => {
    const days = dateRanges[dateRange as keyof typeof dateRanges];
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return sales.filter((s) => new Date(s.timestamp).getTime() > cutoff);
  }, [sales, dateRange]);

  const kpis = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalOrders = filteredSales.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate previous period for comparison
    const days = dateRanges[dateRange as keyof typeof dateRanges];
    const prevPeriodStart = Date.now() - 2 * days * 24 * 60 * 60 * 1000;
    const prevPeriodEnd = Date.now() - days * 24 * 60 * 60 * 1000;
    const prevSales = sales.filter(
      (s) => {
        const saleTime = new Date(s.timestamp).getTime();
        return saleTime > prevPeriodStart && saleTime < prevPeriodEnd;
      }
    );
    const prevRevenue = prevSales.reduce((sum, s) => sum + s.total, 0);
    const revenueDelta = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return { totalRevenue, totalOrders, avgOrderValue, revenueDelta };
  }, [filteredSales, sales, dateRange]);

  // Revenue over time
  const revenueOverTime = useMemo(() => {
    const days = dateRanges[dateRange as keyof typeof dateRanges];
    const dailyData = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: 0,
        orders: 0,
      };
    });

    filteredSales.forEach((sale) => {
      const dayIndex = Math.floor(
        (new Date(sale.timestamp).getTime() - (Date.now() - days * 24 * 60 * 60 * 1000)) /
          (24 * 60 * 60 * 1000)
      );
      if (dayIndex >= 0 && dayIndex < dailyData.length) {
        dailyData[dayIndex].revenue += sale.total;
        dailyData[dayIndex].orders++;
      }
    });

    return dailyData;
  }, [filteredSales, dateRange]);

  // Top flavours by revenue
  const topFlavours = useMemo(() => {
    const flavourRevenue: Record<string, number> = {};
    FLAVOURS.forEach((f) => (flavourRevenue[f.name] = 0));

    filteredSales.forEach((sale) => {
      const perScoop = sale.total / sale.flavours.reduce((sum, f) => sum + f.scoops, 0);
      sale.flavours.forEach((f) => {
        flavourRevenue[f.name] += perScoop * f.scoops;
      });
    });

    return Object.entries(flavourRevenue)
      .map(([name, revenue]) => ({
        name,
        revenue,
        emoji: FLAVOURS.find((f) => f.name === name)?.emoji,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // Orders by base
  const ordersByBase = useMemo(() => {
    const baseCount = { milk: 0, water: 0 };
    filteredSales.forEach((sale) => {
      baseCount[sale.base]++;
    });
    return [
      { name: "Milk", value: baseCount.milk },
      { name: "Water", value: baseCount.water },
    ];
  }, [filteredSales]);

  // AOV over time
  const aovOverTime = useMemo(() => {
    const days = dateRanges[dateRange as keyof typeof dateRanges];
    const dailyData = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        aov: 0,
        count: 0,
      };
    });

    filteredSales.forEach((sale) => {
      const dayIndex = Math.floor(
        (new Date(sale.timestamp).getTime() - (Date.now() - days * 24 * 60 * 60 * 1000)) /
          (24 * 60 * 60 * 1000)
      );
      if (dayIndex >= 0 && dayIndex < dailyData.length) {
        dailyData[dayIndex].aov += sale.total;
        dailyData[dayIndex].count++;
      }
    });

    return dailyData.map((d) => ({
      date: d.date,
      aov: d.count > 0 ? d.aov / d.count : 0,
    }));
  }, [filteredSales, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading sales data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">Sales & Insights</h1>
          <p className="text-muted-foreground mt-1">
            Analyze revenue trends and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button className="neon-glow">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Revenue"
          value={`₹${kpis.totalRevenue.toLocaleString()}`}
          delta={{
            value: Math.abs(kpis.revenueDelta),
            label: "vs prev period",
            positive: kpis.revenueDelta >= 0,
          }}
          icon={<IndianRupee className="w-5 h-5" />}
        />
        <KPICard
          title="Total Orders"
          value={kpis.totalOrders.toLocaleString()}
          icon={<Zap className="w-5 h-5" />}
        />
        <KPICard
          title="Avg Order Value"
          value={`₹${Math.round(kpis.avgOrderValue)}`}
          icon={<DollarSign className="w-5 h-5" />}
        />
      </div>

      {/* Revenue Over Time */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">
          Revenue Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
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
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
              name="Revenue (₹)"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--accent))" }}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Flavours */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">
            Top Flavours by Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topFlavours} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Base */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">
            Orders by Base
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByBase}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="hsl(var(--info))" />
                <Cell fill="hsl(var(--primary))" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {ordersByBase.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: item.name === "Milk" ? "hsl(var(--info))" : "hsl(var(--primary))",
                  }}
                />
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AOV Trend */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">
          Average Order Value Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={aovOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
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
            />
            <Line
              type="monotone"
              dataKey="aov"
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--accent))", r: 5 }}
              name="AOV (₹)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-semibold uppercase tracking-wide">
                  Time
                </th>
                <th className="text-left p-3 text-sm font-semibold uppercase tracking-wide">
                  Machine
                </th>
                <th className="text-left p-3 text-sm font-semibold uppercase tracking-wide">
                  Flavours
                </th>
                <th className="text-left p-3 text-sm font-semibold uppercase tracking-wide">
                  Quantity
                </th>
                <th className="text-left p-3 text-sm font-semibold uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left p-3 text-sm font-semibold uppercase tracking-wide">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.slice(0, 20).map((sale) => (
                <tr key={sale.id} className="border-b border-border">
                  <td className="p-3 text-sm">
                    {new Date(sale.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 text-sm font-medium">{sale.machineName}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {sale.flavours.map((f, i) => (
                        <Badge key={i} variant="outline">
                          {FLAVOURS.find((fl) => fl.name === f.name)?.emoji} {f.scoops}x {f.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-sm">{sale.quantity}ml</td>
                  <td className="p-3 text-sm font-semibold">₹{sale.total}</td>
                  <td className="p-3 text-sm text-muted-foreground">{sale.duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
