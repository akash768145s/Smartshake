import { Machine } from "@/lib/api";
import { StatusPill } from "./StatusPill";
import { Activity, Droplet, Beaker } from "lucide-react";

interface FleetHealthCardProps {
  machine: Machine;
  onClick?: () => void;
}

export function FleetHealthCard({ machine, onClick }: FleetHealthCardProps) {
  const getLowStockItems = () => {
    const items = [];
    if (machine.milkLevel < 15) items.push("Low Milk");
    if (machine.waterLevel < 15) items.push("Low Water");
    
    Object.entries(machine.powderLevels).forEach(([flavour, level]) => {
      if (level < 15) items.push(`Low ${flavour}`);
    });
    
    return items;
  };

  const lowStockItems = getLowStockItems();

  return (
    <button
      onClick={onClick}
      className="w-full glass-card rounded-xl p-4 text-left transition-smooth hover:scale-[1.01] hover:bg-card/60"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-foreground mb-1">{machine.name}</div>
          <div className="text-sm text-muted-foreground">{machine.location}</div>
        </div>
        <StatusPill status={machine.status} withPulse />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm">
            <span className="font-medium text-foreground">{machine.uptime7d.toFixed(1)}%</span>
            <span className="text-muted-foreground ml-1">uptime</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-info" />
          <span className="text-sm">
            <span className="font-medium text-foreground">{Math.round(machine.milkLevel)}%</span>
            <span className="text-muted-foreground ml-1">milk</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-accent" />
          <span className="text-sm">
            <span className="font-medium text-foreground">{machine.dispenses24h}</span>
            <span className="text-muted-foreground ml-1">today</span>
          </span>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {lowStockItems.map((item) => (
            <span
              key={item}
              className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning border border-warning/50"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
