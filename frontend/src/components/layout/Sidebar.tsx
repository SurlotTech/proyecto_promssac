import { useState, type ComponentType } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Route,
  Package,
  Truck,
  MapPin,
  X,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type NavItem = {
  to?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  subItems?: { to: string; label: string }[];
};

const operationsItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/rutas", label: "Rutas", icon: Route },
  { to: "/ordenes", label: "Órdenes", icon: Package },
  { to: "/alertas", label: "Alertas", icon: Bell },
  { to: "/flota", label: "Flota en vivo", icon: MapPin },
  { to: "/vehiculos", label: "Vehículos", icon: Truck },
];

const usersGroup: NavItem = {
  label: "Usuarios",
  icon: Users,
  subItems: [
    { to: "/usuarios/web", label: "Usuarios web" },
    { to: "/usuarios/movil", label: "Usuarios móviles" },
  ],
};

const systemGroup: NavItem = {
  label: "Configuración",
  icon: Settings,
  subItems: [
    { to: "/configuracion/subestados", label: "Subestados" },
    { to: "/configuracion/alertas", label: "Configuración de alertas" },
  ],
};

const pathMatchesSub = (pathname: string, to: string) =>
  pathname === to || pathname.startsWith(`${to}/`);

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Usuarios", "Configuración"]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const renderFlatSection = (items: NavItem[], sectionLabel: string) => (
    <>
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
        {sectionLabel}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to!}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
                )
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </>
  );

  const renderExpandableGroup = (item: NavItem) => {
    if (!item.subItems?.length) return null;
    const isChildActive = item.subItems.some((s) => pathMatchesSub(location.pathname, s.to));

    return (
      <li key={item.label}>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => toggleMenu(item.label)}
            className={cn(
              "group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isChildActive
                ? "bg-sidebar-accent text-white"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
            )}
          >
            <span className="flex min-w-0 items-center gap-3">
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </span>
            {expandedMenus.includes(item.label) ? (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            )}
          </button>
          {expandedMenus.includes(item.label) && (
            <ul className="ml-3 space-y-0.5 border-l border-sidebar-border/60 py-1 pl-3">
              {item.subItems.map((sub) => (
                <li key={sub.to}>
                  <NavLink
                    to={sub.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary font-medium text-primary-foreground shadow-glow"
                          : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-white",
                      )
                    }
                  >
                    <span className="min-w-0 truncate">{sub.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </li>
    );
  };

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden",
          open ? "block animate-fade-in" : "hidden",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-dark text-sidebar-foreground transition-transform duration-300 ease-smooth lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">FleetOps</p>
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                Last Mile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          {renderFlatSection(operationsItems, "Operaciones")}
          <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Usuarios
          </p>
          <ul className="space-y-1">{renderExpandableGroup(usersGroup)}</ul>
          <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Sistema
          </p>
          <ul className="space-y-1">{renderExpandableGroup(systemGroup)}</ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
