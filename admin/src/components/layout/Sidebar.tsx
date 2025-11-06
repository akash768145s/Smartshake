import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  Package,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Settings,
  HelpCircle,
} from "lucide-react";
import smartshakeIcon from "@/assets/smartshake-icon.png";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", to: "/", icon: LayoutDashboard },
  { name: "Machines", to: "/machines", icon: Server },
  { name: "Stocks", to: "/stocks", icon: Package },
  { name: "Sales", to: "/sales", icon: TrendingUp },
  { name: "Alerts", to: "/alerts", icon: AlertTriangle },
  { name: "Cleaning", to: "/cleaning", icon: Sparkles },
  { name: "Settings", to: "/settings", icon: Settings },
  { name: "Support", to: "/support", icon: HelpCircle },
];

export function Sidebar() {
  return (
    <aside className="w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-8 sticky top-0 h-screen">
      {/* Logo */}
      <div className="w-12 h-12 flex items-center justify-center">
        <img src={smartshakeIcon} alt="Smartshake" className="w-10 h-10" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-smooth group relative",
                isActive
                  ? "bg-primary text-primary-foreground neon-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-6 h-6" />
                {/* Tooltip */}
                <span className="absolute left-20 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
