import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "online" | "warning" | "critical" | "offline" | "open" | "muted" | "resolved";
  withPulse?: boolean;
  className?: string;
}

export function StatusPill({ status, withPulse = false, className }: StatusPillProps) {
  const variants = {
    online: "bg-success/20 text-success border-success/50",
    warning: "bg-warning/20 text-warning border-warning/50",
    critical: "bg-destructive/20 text-destructive border-destructive/50",
    offline: "bg-muted text-muted-foreground border-muted",
    open: "bg-destructive/20 text-destructive border-destructive/50",
    muted: "bg-muted text-muted-foreground border-muted",
    resolved: "bg-success/20 text-success border-success/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        variants[status],
        className
      )}
    >
      {withPulse && (status === "online" || status === "critical") && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            status === "online" ? "bg-success pulse-online" : "bg-destructive animate-pulse"
          )}
        />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
