import { Machine } from "@/lib/api";
import { FLAVOURS } from "@/lib/mockData";
import { X, Activity, Droplet, Beaker, Thermometer, Power, CreditCard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MachineDetailDrawerProps {
  machine: Machine;
  onClose: () => void;
}

export function MachineDetailDrawer({ machine, onClose }: MachineDetailDrawerProps) {
  const avgPowderLevel = Object.values(machine.powderLevels).reduce((sum, level) => sum + level, 0) / Object.keys(machine.powderLevels).length;
  
  const handleTestDispense = () => {
    toast.success("Test dispense initiated", {
      description: "Running 50ml water test cycle"
    });
  };

  const handleTriggerCleaning = () => {
    toast.success("Cleaning cycle started", {
      description: "Estimated completion: 15 minutes"
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-card border-l border-border shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{machine.name}</h2>
                <StatusPill status={machine.status} withPulse />
              </div>
              <p className="text-muted-foreground">{machine.location}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Online • last ping {Math.floor(Math.random() * 60)}s ago
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="flavours">Flavours</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Mini KPIs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Revenue (24h)</div>
                  <div className="text-2xl font-bold">₹{machine.revenue24h.toLocaleString()}</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Dispenses (24h)</div>
                  <div className="text-2xl font-bold">{machine.dispenses24h}</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Uptime (7d)</div>
                  <div className="text-2xl font-bold">{machine.uptime7d.toFixed(1)}%</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Avg Prep Time</div>
                  <div className="text-2xl font-bold">{18 + Math.floor(Math.random() * 8)}s</div>
                </div>
              </div>

              {/* System Status */}
              <div className="glass-card rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-lg">System Status</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-info" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/50">
                      4.2°C
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Power className="w-5 h-5 text-primary" />
                      <span className="text-sm">Door State</span>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/50">
                      Closed
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-accent" />
                      <span className="text-sm">Payment Module</span>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/50">
                      Online
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-warning" />
                      <span className="text-sm">Stirrer Motor</span>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/50">
                      Operational
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stock Levels */}
              <div className="glass-card rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-lg">Stock Levels</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-info" />
                        Milk Tank
                      </span>
                      <span className="text-sm font-medium">{Math.round(machine.milkLevel)}%</span>
                    </div>
                    <Progress value={machine.milkLevel} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-primary" />
                        Water Tank
                      </span>
                      <span className="text-sm font-medium">{Math.round(machine.waterLevel)}%</span>
                    </div>
                    <Progress value={machine.waterLevel} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <Beaker className="w-4 h-4 text-accent" />
                        Avg Powder Level
                      </span>
                      <span className="text-sm font-medium">{Math.round(avgPowderLevel)}%</span>
                    </div>
                    <Progress value={avgPowderLevel} className="h-2" />
                  </div>
                </div>
              </div>

              {machine.status !== "online" && (
                <div className="glass-card rounded-xl p-5 border-l-4 border-warning bg-warning/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-warning mb-1">System Warning</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {machine.milkLevel < 15 ? "Milk level critically low. Schedule refill immediately." : "Elevated error rate detected in dispense cycle."}
                      </p>
                      <Button size="sm" variant="outline" className="border-warning text-warning hover:bg-warning/10">
                        Open Troubleshoot
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Flavours Tab */}
            <TabsContent value="flavours" className="space-y-4 mt-6">
              {FLAVOURS.map((flavour) => {
                const level = machine.powderLevels[flavour.name] || 0;
                const dispenses = Math.floor(Math.random() * 50) + 20;
                
                return (
                  <div key={flavour.name} className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                          {flavour.emoji}
                        </div>
                        <div>
                          <h4 className="font-semibold">{flavour.name}</h4>
                          <p className="text-sm text-muted-foreground">{dispenses} dispenses today</p>
                        </div>
                      </div>
                      <Badge variant={level > 30 ? "outline" : "destructive"}>
                        {Math.round(level)}%
                      </Badge>
                    </div>
                    <Progress value={level} className="h-2" />
                  </div>
                );
              })}
            </TabsContent>

            {/* Operations Tab */}
            <TabsContent value="operations" className="space-y-6 mt-6">
              <div className="space-y-3">
                <Button
                  className="w-full justify-start neon-glow"
                  onClick={handleTestDispense}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Run Test Dispense
                </Button>
                
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleTriggerCleaning}
                >
                  <Beaker className="w-4 h-4 mr-2" />
                  Trigger Cleaning Cycle
                </Button>
              </div>

              <div className="glass-card rounded-xl p-5">
                <h3 className="font-semibold mb-4">Recent Errors</h3>
                <div className="space-y-3">
                  {machine.status === "online" ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No errors in last 24 hours</p>
                  ) : (
                    <>
                      <div className="flex items-start gap-3 pb-3 border-b border-border">
                        <Badge variant="destructive" className="mt-0.5">High</Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Milk pump timeout</p>
                          <p className="text-xs text-muted-foreground">2 hours ago • 3 occurrences</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge className="bg-warning/20 text-warning border-warning/50 mt-0.5">Medium</Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Temperature fluctuation</p>
                          <p className="text-xs text-muted-foreground">5 hours ago • 1 occurrence</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-3 mt-6">
              {Array.from({ length: 15 }, (_, i) => {
                const timestamp = new Date(Date.now() - i * 15 * 60 * 1000);
                const types = ["order", "payment", "cleaning", "error", "maintenance"];
                const type = types[Math.floor(Math.random() * types.length)];
                
                return (
                  <div key={i} className="glass-card rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={type === "error" ? "destructive" : "outline"}>
                            {type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          {type === "order" && `Order #${1000 + i}: 2x Chocolate, 1x Vanilla • ₹120`}
                          {type === "payment" && `Payment captured: ₹${40 + Math.random() * 100 | 0} via UPI`}
                          {type === "cleaning" && "Cleaning cycle completed successfully"}
                          {type === "error" && "Cup sensor momentary timeout (recovered)"}
                          {type === "maintenance" && "System health check: All OK"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
