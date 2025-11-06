import { useMemo } from "react";
import { generateMockMachines } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Check, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Cleaning() {
  const machines = useMemo(() => generateMockMachines(), []);

  const cleaningStats = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const cleaned24h = machines.filter((m) => m.lastClean.getTime() > oneDayAgo).length;
    const cleaned7d = machines.filter((m) => m.lastClean.getTime() > sevenDaysAgo).length;

    return {
      compliance24h: (cleaned24h / machines.length) * 100,
      compliance7d: (cleaned7d / machines.length) * 100,
      cleanedToday: cleaned24h,
      total: machines.length,
    };
  }, [machines]);

  const machinesWithStatus = useMemo(() => {
    return machines.map((machine) => {
      const hoursSinceClean = (Date.now() - machine.lastClean.getTime()) / (1000 * 60 * 60);
      let status: "ok" | "due" | "overdue";
      
      if (hoursSinceClean > 48) status = "overdue";
      else if (hoursSinceClean > 24) status = "due";
      else status = "ok";

      return {
        ...machine,
        hoursSinceClean,
        cleaningStatus: status,
        nextDue: new Date(machine.lastClean.getTime() + 24 * 60 * 60 * 1000),
      };
    });
  }, [machines]);

  const handleTriggerCleaning = (machineName: string) => {
    toast.success(`Cleaning cycle initiated for ${machineName}`, {
      description: "Estimated completion: 15 minutes",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">Cleaning & Hygiene</h1>
          <p className="text-muted-foreground mt-1">
            Track cleaning compliance and hygiene standards
          </p>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-wide text-muted-foreground">
                Compliance (24h)
              </div>
              <div className="text-3xl font-bold">{cleaningStats.compliance24h.toFixed(0)}%</div>
            </div>
          </div>
          <Progress value={cleaningStats.compliance24h} className="h-2" />
          <p className="text-sm text-muted-foreground mt-3">
            {cleaningStats.cleanedToday} of {cleaningStats.total} machines cleaned today
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-success" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-wide text-muted-foreground">
                Compliance (7d)
              </div>
              <div className="text-3xl font-bold">{cleaningStats.compliance7d.toFixed(0)}%</div>
            </div>
          </div>
          <Progress value={cleaningStats.compliance7d} className="h-2" />
          <p className="text-sm text-muted-foreground mt-3">
            Weekly compliance tracking
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-wide text-muted-foreground">
                Overdue
              </div>
              <div className="text-3xl font-bold">
                {machinesWithStatus.filter((m) => m.cleaningStatus === "overdue").length}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Machines requiring immediate attention
          </p>
        </div>
      </div>

      {/* Machine Status Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold uppercase tracking-wide">
            Cleaning Schedule Status
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Machine
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Location
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Last Clean
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Next Due
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {machinesWithStatus
                .sort((a, b) => b.hoursSinceClean - a.hoursSinceClean)
                .map((machine) => {
                  const statusColors = {
                    ok: "bg-success/20 text-success border-success/50",
                    due: "bg-warning/20 text-warning border-warning/50",
                    overdue: "bg-destructive/20 text-destructive border-destructive/50",
                  };

                  return (
                    <tr key={machine.id} className="border-b border-border hover:bg-secondary/20">
                      <td className="p-4 font-medium">{machine.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{machine.location}</td>
                      <td className="p-4 text-sm">
                        {machine.hoursSinceClean < 1
                          ? "< 1h ago"
                          : machine.hoursSinceClean < 24
                          ? `${Math.round(machine.hoursSinceClean)}h ago`
                          : `${Math.round(machine.hoursSinceClean / 24)}d ago`}
                      </td>
                      <td className="p-4 text-sm">
                        {machine.nextDue < new Date()
                          ? "Now"
                          : machine.nextDue.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[machine.cleaningStatus]}>
                          {machine.cleaningStatus === "ok" && <Check className="w-3 h-3 mr-1" />}
                          {machine.cleaningStatus === "due" && <Clock className="w-3 h-3 mr-1" />}
                          {machine.cleaningStatus === "overdue" && (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {machine.cleaningStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant={machine.cleaningStatus === "overdue" ? "default" : "outline"}
                          className={machine.cleaningStatus === "overdue" ? "neon-glow" : ""}
                          onClick={() => handleTriggerCleaning(machine.name)}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Trigger Clean
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cleaning Log */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">Recent Cleaning Log</h3>
        <div className="space-y-3">
          {machines
            .sort((a, b) => b.lastClean.getTime() - a.lastClean.getTime())
            .slice(0, 10)
            .map((machine) => (
              <div
                key={machine.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{machine.name}</div>
                    <div className="text-sm text-muted-foreground">{machine.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Auto Cycle</div>
                  <div className="text-xs text-muted-foreground">
                    {machine.lastClean.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/50">
                  <Check className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              </div>
            ))}
        </div>
      </div>

      {/* How-To Panel */}
      <div className="glass-card rounded-2xl p-6 border-l-4 border-primary">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Cleaning Procedure Checklist
        </h3>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">1</Badge>
            <span>Initiate cleaning cycle from admin panel or machine interface</span>
          </li>
          <li className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">2</Badge>
            <span>System will flush all dispensing lines with hot water (3 minutes)</span>
          </li>
          <li className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">3</Badge>
            <span>Sanitization cycle runs with approved cleaning solution (7 minutes)</span>
          </li>
          <li className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">4</Badge>
            <span>Final rinse with filtered water to remove residue (5 minutes)</span>
          </li>
          <li className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">5</Badge>
            <span>System self-test confirms all components operational</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
