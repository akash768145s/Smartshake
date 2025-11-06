import { useMemo, useState } from "react";
import { generateMockMachines, FLAVOURS } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Droplet, Package, AlertTriangle, MapPin, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusPill } from "@/components/dashboard/StatusPill";

export default function Stocks() {
  const machines = useMemo(() => generateMockMachines(), []);
  const [stockLevels, setStockLevels] = useState(() => {
    const initial: Record<string, any> = {};
    machines.forEach(m => {
      initial[m.id] = {
        milk: m.milkLevel,
        water: m.waterLevel,
        powders: { ...m.powderLevels },
        enabledFlavours: Object.keys(m.powderLevels).reduce((acc, f) => {
          acc[f] = true;
          return acc;
        }, {} as Record<string, boolean>)
      };
    });
    return initial;
  });
  const { toast } = useToast();

  const updateStock = (machineId: string, type: 'milk' | 'water', value: number) => {
    setStockLevels(prev => ({
      ...prev,
      [machineId]: {
        ...prev[machineId],
        [type]: Math.max(0, Math.min(100, value))
      }
    }));
  };

  const updatePowder = (machineId: string, flavour: string, value: number) => {
    setStockLevels(prev => ({
      ...prev,
      [machineId]: {
        ...prev[machineId],
        powders: {
          ...prev[machineId].powders,
          [flavour]: Math.max(0, Math.min(100, value))
        }
      }
    }));
  };

  const toggleFlavour = (machineId: string, flavour: string) => {
    setStockLevels(prev => ({
      ...prev,
      [machineId]: {
        ...prev[machineId],
        enabledFlavours: {
          ...prev[machineId].enabledFlavours,
          [flavour]: !prev[machineId].enabledFlavours[flavour]
        }
      }
    }));
    toast({
      title: "Flavour Updated",
      description: `${flavour} ${!stockLevels[machineId].enabledFlavours[flavour] ? 'enabled' : 'disabled'} for this machine.`,
    });
  };

  const refillAll = (machineId: string) => {
    setStockLevels(prev => {
      const newPowders = { ...prev[machineId].powders };
      Object.keys(newPowders).forEach(f => newPowders[f] = 100);
      return {
        ...prev,
        [machineId]: {
          ...prev[machineId],
          milk: 100,
          water: 100,
          powders: newPowders
        }
      };
    });
    toast({
      title: "Stock Refilled",
      description: "All tanks and canisters set to 100%.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">Stock Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage inventory levels per machine
          </p>
        </div>
        <Button variant="outline">
          <Package className="w-4 h-4 mr-2" />
          Export Stock Report
        </Button>
      </div>

      {/* Machine Cards */}
      <div className="grid grid-cols-1 gap-6">
        {machines.map((machine) => {
          const stock = stockLevels[machine.id];
          const milkLevel = stock?.milk ?? machine.milkLevel;
          const waterLevel = stock?.water ?? machine.waterLevel;
          const powderLevels = stock?.powders ?? machine.powderLevels;
          const enabledFlavours = stock?.enabledFlavours ?? {};

          const hasLowStock = milkLevel < 20 || waterLevel < 20 || 
            Object.values(powderLevels).some((l: any) => l < 20);

          return (
            <div key={machine.id} className="glass-card rounded-2xl p-6">
              {/* Machine Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{machine.name}</h3>
                      <StatusPill status={machine.status} />
                      {hasLowStock && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      {machine.location}
                    </div>
                  </div>
                </div>
                <Button size="sm" onClick={() => refillAll(machine.id)} className="neon-glow">
                  <Package className="w-4 h-4 mr-2" />
                  Refill All
                </Button>
              </div>

              {/* Tanks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Milk Tank */}
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-info" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Milk Tank
                      </div>
                      <div className="text-2xl font-bold">{Math.round(milkLevel)}%</div>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(milkLevel)}
                      onChange={(e) => updateStock(machine.id, 'milk', Number(e.target.value))}
                      className="w-20 text-center"
                    />
                  </div>
                  <Progress value={milkLevel} className="h-2" />
                  <div className="mt-3 text-sm text-muted-foreground">
                    ≈ {Math.floor((milkLevel / 100) * 150)} servings left
                  </div>
                </div>

                {/* Water Tank */}
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm uppercase tracking-wide text-muted-foreground">
                        Water Tank
                      </div>
                      <div className="text-2xl font-bold">{Math.round(waterLevel)}%</div>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(waterLevel)}
                      onChange={(e) => updateStock(machine.id, 'water', Number(e.target.value))}
                      className="w-20 text-center"
                    />
                  </div>
                  <Progress value={waterLevel} className="h-2" />
                  <div className="mt-3 text-sm text-muted-foreground">
                    ≈ {Math.floor((waterLevel / 100) * 200)} servings left
                  </div>
                </div>
              </div>

              {/* Powder Canisters */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">
                  Powder Canisters & Flavours
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FLAVOURS.map((flavour) => {
                    const level = powderLevels[flavour.name] ?? 0;
                    const isEnabled = enabledFlavours[flavour.name] !== false;

                    return (
                      <div
                        key={flavour.name}
                        className={`glass-card rounded-xl p-4 transition-opacity ${!isEnabled ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-lg">
                              {flavour.emoji}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{flavour.name}</div>
                              <div className="text-xs text-muted-foreground">{Math.round(level)}%</div>
                            </div>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => toggleFlavour(machine.id, flavour.name)}
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Progress value={level} className="h-2 flex-1" />
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={Math.round(level)}
                            onChange={(e) => updatePowder(machine.id, flavour.name, Number(e.target.value))}
                            className="w-16 h-8 text-xs text-center"
                            disabled={!isEnabled}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ≈ {Math.floor((level / 100) * 80)} servings
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
