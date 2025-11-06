import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FLAVOURS, LOCATIONS } from "@/lib/mockData";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";

export default function Settings() {
  const [flavours, setFlavours] = useState(
    FLAVOURS.map((f, i) => ({ ...f, price: 40, enabled: true, order: i }))
  );

  const handleSave = () => {
    toast.success("Settings saved successfully", {
      description: "Your changes have been applied across all machines",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure pricing, flavours, and system preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="w-full grid grid-cols-3 lg:w-auto">
          <TabsTrigger value="pricing">Pricing & Flavours</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="roles">Roles & Access</TabsTrigger>
        </TabsList>

        {/* Pricing & Flavours */}
        <TabsContent value="pricing" className="space-y-6 mt-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold uppercase tracking-wide">Flavour Management</h3>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Flavour
              </Button>
            </div>

            <div className="space-y-4">
              {flavours.map((flavour, index) => (
                <div
                  key={flavour.name}
                  className="glass-card rounded-xl p-5 flex items-center gap-4"
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                    {flavour.emoji}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>Flavour Name</Label>
                      <Input
                        id={`name-${index}`}
                        value={flavour.name}
                        onChange={(e) => {
                          const updated = [...flavours];
                          updated[index].name = e.target.value;
                          setFlavours(updated);
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`price-${index}`}>Price per Scoop (₹)</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        value={flavour.price}
                        onChange={(e) => {
                          const updated = [...flavours];
                          updated[index].price = parseInt(e.target.value) || 0;
                          setFlavours(updated);
                        }}
                      />
                    </div>

                    <div className="flex items-end gap-4">
                      <div className="flex items-center gap-2 flex-1">
                        <Switch
                          id={`enabled-${index}`}
                          checked={flavour.enabled}
                          onCheckedChange={(checked) => {
                            const updated = [...flavours];
                            updated[index].enabled = checked;
                            setFlavours(updated);
                          }}
                        />
                        <Label htmlFor={`enabled-${index}`} className="text-sm">
                          Enabled
                        </Label>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-semibold mb-3">Preview (Kiosk UI)</h4>
              <div className="flex flex-wrap gap-2">
                {flavours
                  .filter((f) => f.enabled)
                  .map((f) => (
                    <Badge
                      key={f.name}
                      variant="outline"
                      className="text-base px-4 py-2 bg-primary/10 border-primary/50"
                    >
                      {f.emoji} {f.name} • ₹{f.price}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Locations */}
        <TabsContent value="locations" className="space-y-6 mt-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold uppercase tracking-wide">Locations & Branding</h3>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LOCATIONS.map((location) => (
                <div key={location} className="glass-card rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{location}</h4>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 3) + 1} machines assigned
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/50">
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Contact Person</Label>
                      <p className="text-sm">Manager Name</p>
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <p className="text-sm">+91 98765 43210</p>
                    </div>
                    <div>
                      <Label className="text-xs">Operating Hours</Label>
                      <p className="text-sm">6:00 AM - 11:00 PM</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Roles & Access */}
        <TabsContent value="roles" className="space-y-6 mt-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">User Roles</h3>
            
            <div className="space-y-4">
              {[
                {
                  name: "Admin",
                  description: "Full system access with all permissions",
                  count: 2,
                },
                {
                  name: "Location Owner",
                  description: "Manage machines at assigned locations only",
                  count: 6,
                },
                {
                  name: "Maintenance",
                  description: "View alerts and update machine status",
                  count: 12,
                },
              ].map((role) => (
                <div key={role.name} className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{role.name}</h4>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    <Badge variant="outline">{role.count} users</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      "View Dashboard",
                      "Manage Machines",
                      "View Sales",
                      "Manage Stock",
                      "Handle Alerts",
                      "Manage Settings",
                      "User Management",
                      "Export Data",
                    ].map((permission, i) => (
                      <div key={permission} className="flex items-center gap-2">
                        <Switch
                          id={`${role.name}-${i}`}
                          defaultChecked={
                            role.name === "Admin" ||
                            (role.name === "Location Owner" && i < 6) ||
                            (role.name === "Maintenance" && i < 5)
                          }
                        />
                        <Label htmlFor={`${role.name}-${i}`} className="text-xs">
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Footer */}
      <div className="sticky bottom-0 glass-card rounded-2xl p-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Changes will apply to all machines immediately
        </p>
        <div className="flex gap-3">
          <Button variant="ghost">Discard</Button>
          <Button className="neon-glow" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
