import { Search, Plus, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Page Title - will be updated per page */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold uppercase tracking-wide">Dashboard</h1>
        </div>

        {/* Search */}
        <div className="w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search machines, locations..."
            className="pl-9 bg-secondary border-border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="neon-glow">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
          
          <Button size="icon" variant="ghost" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full pulse-online" />
          </Button>
          
          <Button size="icon" variant="ghost">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
