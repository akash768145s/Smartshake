import { useState, useMemo, useEffect } from "react";
import { Machine } from "@/lib/api";
import { api } from "@/lib/api";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { MachineDetailDrawer } from "@/components/machines/MachineDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Machines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const data = await api.getMachines();
        setMachines(data);
      } catch (error) {
        console.error('Error fetching machines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
    const interval = setInterval(fetchMachines, 30000);
    return () => clearInterval(interval);
  }, []);

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(machines.map((m) => m.location))];
    return uniqueLocations;
  }, [machines]);

  const filteredMachines = useMemo(() => {
    const filtered = machines.filter((machine) => {
      const matchesSearch =
        machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || machine.status === statusFilter;
      const matchesLocation =
        locationFilter === "all" || machine.location === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });

    // Sort: Demo machines (MACHINE-XXX) first, then others
    return filtered.sort((a, b) => {
      const aIsDemo = a.name.startsWith('MACHINE-');
      const bIsDemo = b.name.startsWith('MACHINE-');
      
      if (aIsDemo && !bIsDemo) return -1;
      if (!aIsDemo && bIsDemo) return 1;
      if (aIsDemo && bIsDemo) {
        // Sort demo machines by number
        const aNum = parseInt(a.name.split('-')[1] || '0');
        const bNum = parseInt(b.name.split('-')[1] || '0');
        return aNum - bNum;
      }
      // Sort others alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [machines, searchQuery, statusFilter, locationFilter]);

  const handleSimulateError = (machine: Machine) => {
    toast.error(`Simulated error on ${machine.name}`, {
      description: "Milk pump timeout detected",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading machines...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">Fleet Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all vending machines
          </p>
        </div>
        <Button className="neon-glow">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Simulate Alert
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search machines or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {(statusFilter !== "all" || locationFilter !== "all" || searchQuery) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {statusFilter !== "all" && (
              <Badge variant="secondary">Status: {statusFilter}</Badge>
            )}
            {locationFilter !== "all" && (
              <Badge variant="secondary">{locationFilter}</Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary">Search: {searchQuery}</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => {
                setStatusFilter("all");
                setLocationFilter("all");
                setSearchQuery("");
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredMachines.length} of {machines.length} machines
      </div>

      {/* Machines Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
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
                  Status
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Uptime 7d
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Dispenses 24h
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Milk
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Water
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Powder Avg
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Last Clean
                </th>
                <th className="text-left p-4 text-sm font-semibold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((machine) => {
                const avgPowder =
                  Object.values(machine.powderLevels).reduce((sum, level) => sum + level, 0) /
                  Object.keys(machine.powderLevels).length;
                const hoursSinceClean =
                  (Date.now() - new Date(machine.lastClean).getTime()) / (1000 * 60 * 60);

                return (
                  <tr
                    key={machine.id}
                    className="border-b border-border hover:bg-secondary/20 transition-smooth cursor-pointer"
                    onClick={() => setSelectedMachine(machine)}
                  >
                    <td className="p-4">
                      <div className="font-semibold">{machine.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">{machine.location}</div>
                    </td>
                    <td className="p-4">
                      <StatusPill status={machine.status} withPulse />
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{machine.uptime7d.toFixed(1)}%</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{machine.dispenses24h}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-12 h-2 rounded-full ${
                            machine.milkLevel > 30
                              ? "bg-success"
                              : machine.milkLevel > 15
                              ? "bg-warning"
                              : "bg-destructive"
                          }`}
                          style={{ width: `${Math.max(machine.milkLevel, 10)}%` }}
                        />
                        <span className="text-sm font-medium">{Math.round(machine.milkLevel)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 rounded-full bg-info"
                          style={{ width: `${Math.max(machine.waterLevel, 10)}%` }}
                        />
                        <span className="text-sm font-medium">{Math.round(machine.waterLevel)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${Math.max(avgPowder, 10)}%` }}
                        />
                        <span className="text-sm font-medium">{Math.round(avgPowder)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {hoursSinceClean < 1
                          ? "< 1h ago"
                          : hoursSinceClean < 24
                          ? `${Math.round(hoursSinceClean)}h ago`
                          : `${Math.round(hoursSinceClean / 24)}d ago`}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateError(machine);
                        }}
                      >
                        Simulate
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMachines.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No machines found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {/* Machine Detail Drawer */}
      {selectedMachine && (
        <MachineDetailDrawer
          machine={selectedMachine}
          onClose={() => setSelectedMachine(null)}
        />
      )}
    </div>
  );
}
