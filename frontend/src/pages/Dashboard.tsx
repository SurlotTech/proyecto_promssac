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
  MapPin,
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

const performance = [
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

const fleetStatus = [
  { name: "Activos", value: 4, color: "oklch(0.68 0.16 155)" },
  { name: "En ruta", value: 0, color: "oklch(0.65 0.16 240)" },
  { name: "Mantenimiento", value: 0, color: "oklch(0.78 0.15 75)" },
  { name: "Inactivos", value: 0, color: "oklch(0.7 0.02 260)" },
];

const topDrivers = [
  { name: "Giomar", entregas: 142, score: 98 },
  { name: "C. Pérez", entregas: 128, score: 95 },
  { name: "M. Soto", entregas: 119, score: 93 },
  { name: "L. Vega", entregas: 104, score: 90 },
  { name: "J. Díaz", entregas: 96, score: 88 },
];

const recentActivity = [
  { icon: CheckCircle2, color: "text-success", title: "Ruta R-1042 completada", subtitle: "BKT760 · Giomar", time: "hace 5 min" },
  { icon: AlertTriangle, color: "text-warning", title: "Alerta: exceso de velocidad", subtitle: "BHT734 · Av. Javier Prado", time: "hace 12 min" },
  { icon: Package, color: "text-info", title: "12 nuevas órdenes asignadas", subtitle: "Lote LT-882", time: "hace 28 min" },
  { icon: Clock, color: "text-muted-foreground", title: "Mantenimiento programado", subtitle: "CAG900 · 08/05", time: "hace 1 h" },
];

function KpiCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  tone,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "info" | "warning";
  spark: { v: number }[];
}) {
  const toneMap = {
    primary: { bg: "bg-primary-soft", fg: "text-primary", stroke: "oklch(0.62 0.23 27)" },
    success: { bg: "bg-success-soft", fg: "text-success", stroke: "oklch(0.68 0.16 155)" },
    info: { bg: "bg-info-soft", fg: "text-info", stroke: "oklch(0.65 0.16 240)" },
    warning: { bg: "bg-warning-soft", fg: "text-warning", stroke: "oklch(0.78 0.15 75)" },
  }[tone];
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-5 shadow-card hover:shadow-elevated transition-shadow">
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
  const totalFleet = fleetStatus.reduce((a, b) => a + b.value, 0);
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bienvenida, Ana. Resumen operativo de tu flota en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Datos actualizados hace 30 s
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Entregas hoy" value="248" delta="+12.4%" trend="up" icon={Package} tone="primary" spark={spark([12, 18, 14, 22, 28, 25, 34, 40])} />
        <KpiCard label="Rutas activas" value="32" delta="+8.2%" trend="up" icon={RouteIcon} tone="info" spark={spark([8, 10, 9, 14, 18, 22, 26, 32])} />
        <KpiCard label="Flota disponible" value="4 / 4" delta="100%" trend="up" icon={Truck} tone="success" spark={spark([2, 3, 3, 4, 4, 4, 4, 4])} />
        <KpiCard label="Recaudación" value="S/ 18,420" delta="-3.1%" trend="down" icon={DollarSign} tone="warning" spark={spark([20, 22, 19, 24, 21, 18, 17, 18])} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card/40 backdrop-blur-md p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Rendimiento operativo</h3>
              <p className="text-xs text-muted-foreground">Entregas vs pendientes — últimos 12 meses</p>
            </div>
            <div className="flex gap-1 rounded-lg bg-secondary p-1 text-xs font-medium">
              <button className="px-3 py-1.5 rounded-md bg-card/40 backdrop-blur-md shadow-sm">Año</button>
              <button className="px-3 py-1.5 text-muted-foreground">Mes</button>
              <button className="px-3 py-1.5 text-muted-foreground">Semana</button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performance} margin={{ left: -10, right: 8, top: 8 }}>
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

        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-5 shadow-card">
          <h3 className="font-display font-semibold text-lg">Estado de flota</h3>
          <p className="text-xs text-muted-foreground">Distribución actual</p>
          <div className="relative h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fleetStatus} dataKey="value" innerRadius={60} outerRadius={85} paddingAngle={3} stroke="none">
                  {fleetStatus.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-display font-bold">{totalFleet}</div>
              <div className="text-xs text-muted-foreground">vehículos</div>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {fleetStatus.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                  <span className="text-foreground">{s.name}</span>
                </div>
                <span className="font-semibold tabular-nums">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card/40 backdrop-blur-md p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Top conductores</h3>
              <p className="text-xs text-muted-foreground">Ranking por entregas completadas</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDrivers} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 250)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.52 0.03 258)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.52 0.03 258)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.92 0.008 250)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="entregas" radius={[8, 8, 0, 0]} fill="oklch(0.62 0.23 27)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-5 shadow-card">
          <h3 className="font-display font-semibold text-lg">Actividad reciente</h3>
          <p className="text-xs text-muted-foreground">Eventos en tiempo real</p>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="flex gap-3 rounded-lg p-2 -mx-2 hover:bg-secondary/60 transition-colors">
                  <div className={`h-9 w-9 rounded-lg bg-secondary flex items-center justify-center ${a.color}`}>
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
          <button className="mt-4 w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            Ver todas las alertas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;