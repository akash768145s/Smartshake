import { useMemo, useState, useEffect } from "react";
import { Alert } from "@/lib/api";
import { api } from "@/lib/api";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Check, BellOff, X } from "lucide-react";
import { toast } from "sonner";

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.getAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
      return matchesSeverity && matchesStatus;
    });
  }, [alerts, severityFilter, statusFilter]);

  const handleResolve = async (alertId: string) => {
    try {
      await api.updateAlert(alertId, { status: 'resolved' });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: "resolved" as const } : a))
      );
      toast.success("Alert resolved");
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error("Failed to resolve alert");
    }
  };

  const handleMute = async (alertId: string) => {
    try {
      await api.updateAlert(alertId, { status: 'muted' });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: "muted" as const } : a))
      );
      toast("Alert muted for 24h");
    } catch (error) {
      console.error('Error muting alert:', error);
      toast.error("Failed to mute alert");
    }
  };

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    alerts.forEach((alert) => {
      if (alert.status === "open") counts[alert.severity]++;
    });
    return counts;
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">Alerts & Health</h1>
          <p className="text-muted-foreground mt-1">
            Monitor system alerts and fleet health status
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const data = await api.getAlerts();
              setAlerts(data);
              toast("Refreshed alert data");
            } catch (error) {
              toast.error("Failed to refresh alerts");
            }
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border-l-4 border-destructive">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-wide text-muted-foreground mb-1">
                Critical
              </div>
              <div className="text-3xl font-bold text-destructive">{severityCounts.critical}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border-l-4 border-accent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-wide text-muted-foreground mb-1">High</div>
              <div className="text-3xl font-bold text-accent">{severityCounts.high}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border-l-4 border-warning">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-wide text-muted-foreground mb-1">
                Medium
              </div>
              <div className="text-3xl font-bold text-warning">{severityCounts.medium}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border-l-4 border-info">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-wide text-muted-foreground mb-1">Low</div>
              <div className="text-3xl font-bold text-info">{severityCounts.low}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-info" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap gap-4">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="muted">Muted</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {(severityFilter !== "all" || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSeverityFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const severityColors = {
            critical: "border-l-destructive bg-destructive/5",
            high: "border-l-accent bg-accent/5",
            medium: "border-l-warning bg-warning/5",
            low: "border-l-info bg-info/5",
          };

          const severityBadges = {
            critical: <Badge variant="destructive">Critical</Badge>,
            high: <Badge className="bg-accent/20 text-accent border-accent/50">High</Badge>,
            medium: <Badge className="bg-warning/20 text-warning border-warning/50">Medium</Badge>,
            low: <Badge className="bg-info/20 text-info border-info/50">Low</Badge>,
          };

          return (
            <div
              key={alert.id}
              className={`glass-card rounded-xl p-5 border-l-4 ${severityColors[alert.severity]} cursor-pointer transition-smooth hover:scale-[1.01]`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {severityBadges[alert.severity]}
                    <Badge variant="outline">{alert.category}</Badge>
                    <StatusPill status={alert.status} />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{alert.machineName}</span>
                    <span>•</span>
                    <span>
                      {formatTimeAgo(alert.timestamp)}
                    </span>
                    {alert.occurrences > 1 && (
                      <>
                        <span>•</span>
                        <span>{alert.occurrences} occurrences</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {alert.status === "open" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMute(alert.id);
                        }}
                      >
                        <BellOff className="w-4 h-4 mr-2" />
                        Mute 24h
                      </Button>
                      <Button
                        size="sm"
                        className="neon-glow"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(alert.id);
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Resolve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No alerts right now</h3>
            <p className="text-muted-foreground">All systems steady</p>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedAlert(null)}
        >
          <div
            className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="destructive">{selectedAlert.severity}</Badge>
                  <Badge variant="outline">{selectedAlert.category}</Badge>
                </div>
                <h2 className="text-2xl font-bold">{selectedAlert.title}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedAlert(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedAlert.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Machine</div>
                    <div className="font-medium">{selectedAlert.machineName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">First Seen</div>
                    <div className="font-medium">
                      {new Date(selectedAlert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Occurrences</div>
                    <div className="font-medium">{selectedAlert.occurrences}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <StatusPill status={selectedAlert.status} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recommended Actions</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Check physical connection to the affected component</li>
                  <li>Review recent maintenance logs for this machine</li>
                  <li>Run diagnostic cycle to isolate the issue</li>
                  <li>If problem persists, schedule technician visit</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 neon-glow"
                  onClick={() => {
                    handleResolve(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                >
                  Mark Resolved
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handleMute(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                >
                  Mute 24h
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
