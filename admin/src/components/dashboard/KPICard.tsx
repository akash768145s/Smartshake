import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  icon?: ReactNode;
  trend?: number[]; // Sparkline data
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function KPICard({ title, value, delta, icon, trend, size = "md", className }: KPICardProps) {
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const valueSize = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("glass-card rounded-2xl transition-smooth hover:scale-[1.02]", sizeClasses[size], className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
          {title}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className={cn("font-bold text-foreground", valueSize[size])}>
          {value}
        </div>

        {delta && (
          <div className="flex items-center gap-2">
            {delta.positive !== undefined && (
              delta.positive ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )
            )}
            <span className={cn(
              "text-sm font-medium",
              delta.positive === true && "text-success",
              delta.positive === false && "text-destructive",
              delta.positive === undefined && "text-muted-foreground"
            )}>
              {delta.positive !== undefined && (delta.positive ? "+" : "")}{delta.value}% {delta.label}
            </span>
          </div>
        )}

        {trend && trend.length > 0 && (
          <div className="h-12 flex items-end gap-0.5">
            {trend.map((value, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t"
                style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
