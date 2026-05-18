import { useState, type ComponentType, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Route,
  Package,
  Truck,
  MapPin,
  X,
  Users,
  UserSquare2,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Bell,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { SIDEBAR_PERMISSION_MAP } from "@/domain/permissions";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

type NavItem = {
  to?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  subItems?: { to: string; label: string; end?: boolean }[];
};

const operationsItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/rutas", label: "Rutas", icon: Route },
  { to: "/ordenes", label: "Órdenes", icon: Package },
  { to: "/flota", label: "Flota en vivo", icon: MapPin },
  { to: "/vehiculos", label: "Vehículos", icon: Truck },
  { to: "/clientes", label: "Clientes", icon: UserSquare2 },
  { to: "/configuracion/alertas", label: "Alertas", icon: Bell },
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
    { to: "/configuracion/subestados", label: "Estados" },
    { to: "/configuracion/alertas/parametros", label: "Conf. Alertas" },
    { to: "/configuracion/notificaciones", label: "Notificaciones" },
  ],
};

const pathMatchesSub = (pathname: string, to: string) =>
  pathname === to || pathname.startsWith(`${to}/`);

const Sidebar = ({ open, onClose, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Usuarios", "Configuración"]);

  const filteredOperationsItems = useMemo(
    () =>
      operationsItems.filter((item) => {
        if (!item.to) return true;
        const perm = SIDEBAR_PERMISSION_MAP[item.to];
        return perm ? hasPermission(perm) : true;
      }),
    [hasPermission],
  );

  const showUsersGroup = useMemo(() => {
    return usersGroup.subItems?.some((s) => {
      const perm = SIDEBAR_PERMISSION_MAP[s.to];
      return perm ? hasPermission(perm) : true;
    });
  }, [hasPermission]);

  const filteredUsersSubItems = useMemo(
    () =>
      usersGroup.subItems?.filter((s) => {
        const perm = SIDEBAR_PERMISSION_MAP[s.to];
        return perm ? hasPermission(perm) : true;
      }) ?? [],
    [hasPermission],
  );

  const showSystemGroup = useMemo(() => {
    return systemGroup.subItems?.some((s) => {
      const perm = SIDEBAR_PERMISSION_MAP[s.to];
      return perm ? hasPermission(perm) : true;
    });
  }, [hasPermission]);

  const filteredSystemSubItems = useMemo(
    () =>
      systemGroup.subItems?.filter((s) => {
        const perm = SIDEBAR_PERMISSION_MAP[s.to];
        return perm ? hasPermission(perm) : true;
      }) ?? [],
    [hasPermission],
  );

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const renderFlatSection = (items: NavItem[], sectionLabel: string) => (
    <>
      {!isCollapsed ? (
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 transition-opacity duration-300">
          {sectionLabel}
        </p>
      ) : (
        <div className="mx-auto my-3 w-8 border-t border-white/10" />
      )}
      <ul className={cn("flex flex-col gap-1", isCollapsed && "gap-4")}>
        {items.map((item) => {
          const navLink = (
            <NavLink
              to={item.to!}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center transition-all duration-200",
                  isCollapsed
                    ? "h-10 w-10 justify-center rounded-xl"
                    : "w-full gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? isCollapsed
                      ? "bg-white/15 text-white shadow-sm"
                      : "bg-primary text-primary-foreground shadow-glow"
                    : isCollapsed
                      ? "text-white/70 hover:bg-white/10 hover:text-white"
                      : "text-white/70 hover:bg-sidebar-accent hover:text-white",
                )
              }
            >
              <item.icon className={cn("shrink-0", isCollapsed ? "h-[20px] w-[20px]" : "h-[18px] w-[18px]")} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );

          return (
            <li key={item.to} className={cn("w-full", isCollapsed && "flex justify-center")}>
              {isCollapsed ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#212121] border-zinc-800 text-white">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                navLink
              )}
            </li>
          );
        })}
      </ul>
    </>
  );

  const renderExpandableGroup = (item: NavItem, filteredSubItems?: { to: string; label: string; end?: boolean }[]) => {
    const subItems = filteredSubItems ?? item.subItems;
    if (!subItems?.length) return null;
    const isChildActive = subItems.some((s) => pathMatchesSub(location.pathname, s.to));

    const button = (
      <button
        type="button"
        onClick={() => !isCollapsed && toggleMenu(item.label)}
        className={cn(
          "group flex items-center transition-all duration-200",
          isCollapsed
            ? "h-10 w-10 justify-center rounded-xl"
            : "w-full justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
          isChildActive
            ? isCollapsed ? "bg-white/15 text-white" : "bg-sidebar-accent text-white"
            : isCollapsed ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-white/70 hover:bg-sidebar-accent hover:text-white",
        )}
      >
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3">
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>
            {expandedMenus.includes(item.label) ? (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            )}
          </>
        ) : (
          <item.icon className="h-[20px] w-[20px] shrink-0" />
        )}
      </button>
    );

    return (
      <li key={item.label} className={cn("w-full", isCollapsed && "flex justify-center")}>
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right" className="bg-[#212121] border-zinc-800 text-white">
                {item.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          button
        )}
        {!isCollapsed && expandedMenus.includes(item.label) && (
          <ul className="ml-3 space-y-0.5 border-l border-sidebar-border/60 py-1 pl-3">
            {subItems.map((sub) => (
              <li key={sub.to}>
                <NavLink
                  to={sub.to}
                  end={sub.end === true}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary font-medium text-primary-foreground shadow-glow"
                        : "text-white/70 hover:bg-sidebar-accent hover:text-white",
                    )
                  }
                >
                  <span className="min-w-0 truncate">{sub.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
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
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#212121] text-sidebar-foreground transition-all duration-300 ease-smooth lg:static lg:translate-x-0",
          isCollapsed ? "w-16" : "w-60",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className={cn("flex h-14 items-center px-5", isCollapsed ? "justify-center px-0" : "justify-between")}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight transition-opacity duration-300">
                <p className="text-sm font-bold text-white">FleetOps</p>
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                  PROMSSAC
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className={cn("flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10", isCollapsed ? "px-2" : "px-3")}>
          {renderFlatSection(filteredOperationsItems, "Operaciones")}

          {showUsersGroup ? (
            <>
              {!isCollapsed ? (
                <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 transition-opacity duration-300">
                  Usuarios
                </p>
              ) : (
                <div className="mx-auto my-3 w-6 border-t border-white/10" />
              )}
              <ul className={cn("flex flex-col gap-1", isCollapsed && "gap-4")}>
                {renderExpandableGroup(usersGroup, filteredUsersSubItems)}
              </ul>
            </>
          ) : null}

          {showSystemGroup ? (
            <>
              {!isCollapsed ? (
                <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 transition-opacity duration-300">
                  Sistema
                </p>
              ) : (
                <div className="mx-auto my-3 w-6 border-t border-white/10" />
              )}
              <ul className={cn("flex flex-col gap-1", isCollapsed && "gap-4")}>
                {renderExpandableGroup(systemGroup, filteredSystemSubItems)}
              </ul>
            </>
          ) : null}
        </nav>

        <div className="p-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleCollapse}
                  className={cn(
                    "flex items-center transition-all duration-200 hover:text-white",
                    isCollapsed
                      ? "h-10 w-10 justify-center rounded-xl mx-auto bg-transparent hover:bg-white/10 text-white/70"
                      : "w-full gap-3 rounded-lg px-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <div className={cn("flex shrink-0 items-center justify-center rounded", !isCollapsed && "h-6 w-6 border border-white/20")}>
                    {isCollapsed ? (
                      <ChevronRight className="h-5 w-5" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </div>
                </button>
              </TooltipTrigger>
              {!isCollapsed && (
                <TooltipContent side="right" className="bg-[#212121] border-zinc-800 text-white">
                  Contraer navegación
                </TooltipContent>
              )}
              {isCollapsed && (
                <TooltipContent side="right" className="bg-[#212121] border-zinc-800 text-white">
                  Expandir navegación
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
