import { useState, useEffect, useRef } from "react";
import {
  Truck,
  Package,
  Route as RouteIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Navigation,
  Activity,
  Maximize2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import PageHeader from "@/components/PageHeader";
import { PromssacMap } from "@/components/maps/PromssacMap";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Centro aproximado de Perú para encuadrar todo el país a un nivel de zoom óptimo
const PERU_CENTER: [number, number] = [-75.0152, -9.19]; // Formato [longitud, latitud]
const DEFAULT_ZOOM = 5.2;

// Mock de conductores distribuidos estratégicamente a lo largo del Perú (Formato [lng, lat])
const mockDrivers = [
  {
    id: "drv-1",
    name: "Giomar",
    plate: "BKT-760",
    speed: 65,
    status: "in_route",
    lastSeen: "Hace 2 min",
    city: "Arequipa",
    coords: [-71.5375, -16.4090] as [number, number],
  },
  {
    id: "drv-2",
    name: "C. Pérez",
    plate: "BHT-734",
    speed: 45,
    status: "in_route",
    lastSeen: "Hace 5 min",
    city: "Trujillo",
    coords: [-79.0290, -8.1100] as [number, number],
  },
  {
    id: "drv-3",
    name: "M. Soto",
    plate: "AQW-912",
    speed: 0,
    status: "stopped",
    lastSeen: "Hace 8 min",
    city: "Cusco",
    coords: [-71.9670, -13.5220] as [number, number],
  },
  {
    id: "drv-4",
    name: "L. Vega",
    plate: "CAG-900",
    speed: 55,
    status: "in_route",
    lastSeen: "Hace 1 min",
    city: "Lima",
    coords: [-77.0428, -12.0464] as [number, number],
  },
  {
    id: "drv-5",
    name: "J. Díaz",
    plate: "VHR-321",
    speed: 70,
    status: "in_route",
    lastSeen: "Hace 3 min",
    city: "Huancayo",
    coords: [-75.2100, -12.0680] as [number, number],
  },
];

const performanceYear = [
  { m: "Ene", entregas: 320, pendientes: 40 },
  { m: "Feb", entregas: 410, pendientes: 55 },
  { m: "Mar", entregas: 380, pendientes: 30 },
  { m: "Abr", entregas: 520, pendientes: 60 },
  { m: "May", entregas: 610, pendientes: 45 },
  { m: "Jun", entregas: 720, pendientes: 70 },
  { m: "Jul", entregas: 690, pendientes: 50 },
  { m: "Ago", entregas: 810, pendientes: 65 },
  { m: "Sep", entregas: 890, pendientes: 55 },
  { m: "Oct", entregas: 940, pendientes: 60 },
  { m: "Nov", entregas: 1020, pendientes: 75 },
  { m: "Dic", entregas: 1180, pendientes: 80 },
];

const performanceMonth = [
  { m: "Sem 1", entregas: 140, pendientes: 15 },
  { m: "Sem 2", entregas: 165, pendientes: 20 },
  { m: "Sem 3", entregas: 180, pendientes: 10 },
  { m: "Sem 4", entregas: 215, pendientes: 25 },
];

const performanceWeek = [
  { m: "Lun", entregas: 24, pendientes: 3 },
  { m: "Mar", entregas: 32, pendientes: 5 },
  { m: "Mié", entregas: 28, pendientes: 2 },
  { m: "Jue", entregas: 35, pendientes: 6 },
  { m: "Vie", entregas: 42, pendientes: 4 },
  { m: "Sáb", entregas: 38, pendientes: 8 },
  { m: "Dom", entregas: 15, pendientes: 1 },
];

const recentActivity = [
  { icon: CheckCircle2, bg: "bg-success-soft", fg: "text-success", title: "Ruta R-1042 completada", subtitle: "BKT760 · Giomar", time: "hace 5 min" },
  { icon: AlertTriangle, bg: "bg-warning-soft", fg: "text-warning", title: "Alerta: exceso de velocidad", subtitle: "BHT734 · Av. Javier Prado", time: "hace 12 min" },
  { icon: Package, bg: "bg-info-soft", fg: "text-info", title: "12 nuevas órdenes asignadas", subtitle: "Lote LT-882", time: "hace 28 min" },
  { icon: Clock, bg: "bg-secondary/40", fg: "text-muted-foreground", title: "Mantenimiento programado", subtitle: "CAG900 · 08/05", time: "hace 1 h" },
];

const orderDistribution = [
  { name: "Entregadas", value: 145, color: "#dc2626" },
  { name: "En ruta", value: 52, color: "#f87171" },
  { name: "Pendientes", value: 38, color: "#fca5a5" },
  { name: "No entregadas", value: 13, color: "#fecaca" },
];

const monthlyRevenue = [
  { m: "Ene", ingresos: 14200, gastos: 8900 },
  { m: "Feb", ingresos: 15800, gastos: 9200 },
  { m: "Mar", ingresos: 13500, gastos: 8500 },
  { m: "Abr", ingresos: 18100, gastos: 10100 },
  { m: "May", ingresos: 20500, gastos: 11200 },
  { m: "Jun", ingresos: 22300, gastos: 11800 },
];

// Generador de marcadores DOM personalizados para MapLibre GL
function createDriverMarkerEl(status: string) {
  const el = document.createElement("div");
  const isStopped = status === "stopped";
  const mainColor = isStopped ? "#f43f5e" : "#2563eb"; // Rojo para detenido, azul para en ruta
  const ringColor = isStopped ? "rgba(244, 63, 94, 0.3)" : "rgba(37, 99, 235, 0.3)";

  el.innerHTML = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;cursor:pointer">
      ${!isStopped ? `<div style="position:absolute;width:32px;height:32px;border-radius:50%;background:${ringColor};animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite"></div>` : ""}
      <div style="position:relative;display:flex;width:24px;height:24px;align-items:center;justify-content:center;border-radius:50%;background:${mainColor};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);color:white;transition:all 0.2s ease-in-out">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
          <path d="M19 18h2a1 1 0 0 0 1-1v-5.172a2 2 0 0 0-.586-1.414l-2.414-2.414A2 2 0 0 0 17.586 7.5H14"></path>
          <circle cx="7" cy="18" r="2"></circle>
          <circle cx="17" cy="18" r="2"></circle>
        </svg>
      </div>
    </div>
  `;
  return el;
}

interface KpiCardProps {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "info" | "warning";
  spark: { v: number }[];
}

function KpiCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  tone,
  spark,
}: KpiCardProps) {
  const toneMap = {
    primary: { bg: "bg-primary-soft", fg: "text-primary", stroke: "oklch(0.62 0.23 27)" },
    success: { bg: "bg-success-soft", fg: "text-success", stroke: "oklch(0.68 0.16 155)" },
    info: { bg: "bg-info-soft", fg: "text-info", stroke: "oklch(0.65 0.16 240)" },
    warning: { bg: "bg-warning-soft", fg: "text-warning", stroke: "oklch(0.78 0.15 75)" },
  }[tone];
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-2xl border border-border/40 bg-white/30 shadow-md p-5 hover:shadow-elevated transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-display font-bold text-foreground">{value}</div>
        </div>
        <div className={`h-10 w-10 rounded-xl ${toneMap.bg} ${toneMap.fg} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend === "up" ? "text-success" : "text-destructive"}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {delta}
          <span className="text-muted-foreground font-normal ml-1">vs mes ant.</span>
        </div>
      </div>
      <div className="-mx-2 -mb-2 mt-3 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark}>
            <defs>
              <linearGradient id={`sp-${tone}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={toneMap.stroke} stopOpacity={0.35} />
                <stop offset="100%" stopColor={toneMap.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={toneMap.stroke} strokeWidth={2} fill={`url(#sp-${tone})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const spark = (n: number[]) => n.map((v) => ({ v }));

const Dashboard = () => {
  const [mapInst, setMapInst] = useState<maplibregl.Map | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [modalMapInst, setModalMapInst] = useState<maplibregl.Map | null>(null);
  const [timeframe, setTimeframe] = useState<"year" | "month" | "week">("year");
  const [donutHoverIndex, setDonutHoverIndex] = useState(-1);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const modalMarkersRef = useRef<maplibregl.Marker[]>([]);

  const activePerformanceData = {
    year: performanceYear,
    month: performanceMonth,
    week: performanceWeek,
  }[timeframe];

  useEffect(() => {
    if (!mapInst) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Agregar nuevos marcadores
    mockDrivers.forEach((driver) => {
      const el = createDriverMarkerEl(driver.status);
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family:inherit;min-width:160px;padding:4px">
          <div style="display:flex;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px">
            <span style="font-weight:700;font-size:13px;color:#0f172a">${driver.name}</span>
            <span style="font-size:9px;padding:2px 6px;border-radius:9999px;font-weight:600;margin-left:auto;${
              driver.status === "in_route" ? "background:#dbeafe;color:#1e40af" : "background:#ffe4e6;color:#9f1239"
            }">${driver.status === "in_route" ? "En ruta" : "Detenido"}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#475569">
            <div style="display:flex;justify-content:space-between"><span>Placa:</span><strong style="color:#0f172a">${driver.plate}</strong></div>
            <div style="display:flex;justify-content:space-between"><span>Ciudad:</span><strong style="color:#0f172a">${driver.city}</strong></div>
            ${driver.status === "in_route" ? `<div style="display:flex;justify-content:space-between"><span>Velocidad:</span><strong style="color:#2563eb">${driver.speed} km/h</strong></div>` : ""}
            <div style="display:flex;justify-content:space-between"><span>Última señal:</span><span>${driver.lastSeen}</span></div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(driver.coords)
        .setPopup(popup)
        .addTo(mapInst);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [mapInst]);

  useEffect(() => {
    if (!modalMapInst) return;

    modalMarkersRef.current.forEach((m) => m.remove());
    modalMarkersRef.current = [];

    mockDrivers.forEach((driver) => {
      const el = createDriverMarkerEl(driver.status);
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-family:inherit;min-width:160px;padding:4px">
          <div style="display:flex;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px">
            <span style="font-weight:700;font-size:13px;color:#0f172a">${driver.name}</span>
            <span style="font-size:9px;padding:2px 6px;border-radius:9999px;font-weight:600;margin-left:auto;${
              driver.status === "in_route" ? "background:#dbeafe;color:#1e40af" : "background:#ffe4e6;color:#9f1239"
            }">${driver.status === "in_route" ? "En ruta" : "Detenido"}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#475569">
            <div style="display:flex;justify-content:space-between"><span>Placa:</span><strong style="color:#0f172a">${driver.plate}</strong></div>
            <div style="display:flex;justify-content:space-between"><span>Ciudad:</span><strong style="color:#0f172a">${driver.city}</strong></div>
            ${driver.status === "in_route" ? `<div style="display:flex;justify-content:space-between"><span>Velocidad:</span><strong style="color:#2563eb">${driver.speed} km/h</strong></div>` : ""}
            <div style="display:flex;justify-content:space-between"><span>Última señal:</span><span>${driver.lastSeen}</span></div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(driver.coords)
        .setPopup(popup)
        .addTo(modalMapInst);

      modalMarkersRef.current.push(marker);
    });

    return () => {
      modalMarkersRef.current.forEach((m) => m.remove());
      modalMarkersRef.current = [];
    };
  }, [modalMapInst]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Bienvenida, Ana. Resumen operativo de tu flota en tiempo real."
        actions={
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Datos actualizados hace 30 s
          </div>
        }
      />

      <div className="space-y-6 p-4 pt-1 sm:p-6 sm:pt-2 lg:p-8 lg:pt-2">
        {/* Fila 1: KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Órdenes" value="248" delta="+12.4%" trend="up" icon={Package} tone="primary" spark={spark([12, 18, 14, 22, 28, 25, 34, 40])} />
        <KpiCard label="Rutas" value="32" delta="+8.2%" trend="up" icon={RouteIcon} tone="info" spark={spark([8, 10, 9, 14, 18, 22, 26, 32])} />
        <KpiCard label="Flota" value="4 / 4" delta="100%" trend="up" icon={Truck} tone="success" spark={spark([2, 3, 3, 4, 4, 4, 4, 4])} />
        <KpiCard label="Recaudación" value="S/ 18,420" delta="-3.1%" trend="down" icon={DollarSign} tone="warning" spark={spark([20, 22, 19, 24, 21, 18, 17, 18])} />
      </div>

      {/* Fila 2: mapa (ancho completo) + distribución */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        {/* Card del Mapa */}
        <div className="xl:col-span-2 rounded-2xl border border-border/40 bg-white/30 shadow-md p-5 flex flex-col h-[520px] relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 z-10">
            <div>
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary animate-pulse" />
                Flota en tiempo real (Perú)
              </h3>
              <p className="text-xs text-muted-foreground">Monitoreo geolocalizado en vivo de conductores</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMapModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors shadow-sm"
                title="Ver mapa completo"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Ampliar
              </button>
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                En vivo
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border border-border bg-muted/20 relative min-h-[300px]">
            <PromssacMap
              mapKey="dashboard-map"
              center={PERU_CENTER}
              zoom={DEFAULT_ZOOM}
              showStylePicker={true}
              defaultStyle="default"
              className="h-full w-full"
              containerClassName="h-full w-full border-none"
              onMap={(map) => {
                setMapInst(map);
                return () => setMapInst(null);
              }}
            />
          </div>
        </div>

        {/* Card de Distribución de Órdenes */}
        <div className="rounded-2xl border border-border/40 bg-white/30 shadow-md p-5 flex flex-col h-[520px]">
          <div>
            <h3 className="font-display font-semibold text-lg">Distribución de órdenes</h3>
            <p className="text-xs text-muted-foreground">Estado actual de las órdenes</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-full max-h-[320px] max-w-[280px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={135}
                    paddingAngle={0}
                    dataKey="value"
                    nameKey="name"
                    animationBegin={0}
                    animationDuration={800}
                    activeIndex={donutHoverIndex >= 0 ? donutHoverIndex : undefined}
                  >
                    {orderDistribution.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        onMouseEnter={() => setDonutHoverIndex(i)}
                        onMouseLeave={() => setDonutHoverIndex(-1)}
                      />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="47%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 28, fontWeight: 700, fill: "#1f2933" }}
                  >
                    {donutHoverIndex >= 0
                      ? orderDistribution[donutHoverIndex].value
                      : orderDistribution.reduce((s, i) => s + i.value, 0)}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 12, fontWeight: 500, fill: "#8a9aab" }}
                  >
                    {donutHoverIndex >= 0
                      ? orderDistribution[donutHoverIndex].name
                      : "Total"}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {orderDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fila 3: Actividad + Rendimiento */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        {/* Card de Actividad Reciente */}
        <div className="rounded-2xl border border-border/40 bg-white/30 shadow-md p-5 flex flex-col h-[400px]">
          <div>
            <h3 className="font-display font-semibold text-lg">Actividad reciente</h3>
            <p className="text-xs text-muted-foreground">Eventos en tiempo real</p>
          </div>
          <ul className="mt-4 space-y-3 flex-1 overflow-y-auto overflow-x-hidden pr-1">
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="flex gap-3 rounded-lg p-2 hover:bg-muted/40 transition-colors">
                  <div className={`h-9 w-9 rounded-lg ${a.bg} ${a.fg} flex items-center justify-center`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.subtitle}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground whitespace-nowrap">{a.time}</div>
                </li>
              );
            })}
          </ul>
          <button className="mt-4 w-full rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shrink-0 shadow-sm">
            Ver todas las alertas
          </button>
        </div>

        {/* Card de Rendimiento Operativo */}
        <div className="xl:col-span-2 rounded-2xl border border-border/40 bg-white/30 shadow-md p-5 flex flex-col h-[400px]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Rendimiento operativo</h3>
              <p className="text-xs text-muted-foreground">
                {timeframe === "year"
                  ? "Entregas vs pendientes — últimos 12 meses"
                  : timeframe === "month"
                  ? "Entregas vs pendientes — semanas del mes"
                  : "Entregas vs pendientes — días de la semana"}
              </p>
            </div>
            <div className="flex gap-1 rounded-xl bg-muted p-1 text-xs font-medium border border-border">
              <button
                onClick={() => setTimeframe("year")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === "year"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Año
              </button>
              <button
                onClick={() => setTimeframe("month")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === "month"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setTimeframe("week")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === "week"
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Semana
              </button>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activePerformanceData} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g-entregas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.23 27)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.62 0.23 27)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g-pend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.16 240)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="oklch(0.65 0.16 240)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 250)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "oklch(0.52 0.03 258)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.03 258)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.92 0.008 250)",
                    boxShadow: "0 10px 30px -12px oklch(0.2 0.02 260 / 0.18)",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="entregas" stroke="oklch(0.62 0.23 27)" strokeWidth={2.5} fill="url(#g-entregas)" />
                <Area type="monotone" dataKey="pendientes" stroke="oklch(0.65 0.16 240)" strokeWidth={2} fill="url(#g-pend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal: Mapa ampliado */}
      <Dialog open={mapModalOpen} onOpenChange={setMapModalOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 sm:rounded-lg [&>button]:z-10">
          <DialogTitle className="sr-only">Mapa ampliado - Flota en tiempo real</DialogTitle>
          <DialogDescription className="sr-only">Vista ampliada del mapa de monitoreo geolocalizado de la flota</DialogDescription>
          <div className="absolute top-3 right-12 z-10 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              En vivo
            </div>
          </div>
          <PromssacMap
            mapKey="dashboard-map-modal"
            center={PERU_CENTER}
            zoom={DEFAULT_ZOOM}
            showStylePicker={true}
            defaultStyle="default"
            className="h-full w-full rounded-lg"
            containerClassName="h-full w-full border-none rounded-lg"
            onMap={(map) => {
              setModalMapInst(map);
              return () => setModalMapInst(null);
            }}
          />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
