import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Info,
  MapPin,
  Navigation,
  Package,
  Route,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  dashboardActiveRoutes,
  dashboardAlerts,
  dashboardOrderStatusBreakdown,
  dashboardOrdersTrend,
} from "@/data/dashboard";
import { cn } from "@/lib/utils";

const ordersChartConfig = {
  ordenes: {
    label: "Órdenes",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const breakdownColors = [
  "hsl(var(--muted-foreground))",
  "hsl(var(--info))",
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
];

const alertAccent: Record<(typeof dashboardAlerts)[number]["type"], string> = {
  warning: "border-l-warning bg-warning-soft/40",
  info: "border-l-info bg-info-soft/50",
  success: "border-l-success bg-success-soft/40",
};

const alertIcon: Record<(typeof dashboardAlerts)[number]["type"], typeof AlertTriangle> = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const Dashboard = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen operativo de tu flota y entregas en tiempo real."
      />

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Vehículos activos" value={6} delta="+12% vs ayer" icon={Truck} tone="primary" />
          <StatCard label="Órdenes hoy" value={142} delta="+8 últimas 1h" icon={Package} tone="info" />
          <StatCard label="Rutas activas" value={9} icon={Route} tone="success" />
          <StatCard label="Conductores" value={12} icon={Users} tone="warning" />
        </div>

        <div className="rounded-xl border border-border bg-gradient-dark p-5 text-white shadow-md sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary shadow-glow">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                  Tu flota está funcionando al 87%
                </h2>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/75">
                  Optimiza la asignación de rutas y reduce tiempos de entrega gestionando tus vehículos
                  desde un solo lugar.
                </p>
              </div>
            </div>
            <Link to="/vehiculos" className="shrink-0">
              <Button className="h-10 w-full rounded-xl bg-primary px-6 shadow-md hover:bg-primary-hover sm:w-auto">
                Ir a Vehículos
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <Card className="border-border/80 shadow-sm xl:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Órdenes — últimos 7 días</CardTitle>
              <CardDescription>Volumen diario (referencia operativa)</CardDescription>
            </CardHeader>
            <CardContent className="pl-0 pr-2 pt-0">
              <ChartContainer config={ordersChartConfig} className="aspect-[21/10] w-full min-h-[220px] sm:aspect-[2/1]">
                <AreaChart
                  data={dashboardOrdersTrend}
                  margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
                  accessibilityLayer
                >
                  <defs>
                    <linearGradient id="fillOrdenes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-ordenes)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-ordenes)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis hide domain={["dataMin - 10", "dataMax + 15"]} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="ordenes"
                    stroke="var(--color-ordenes)"
                    strokeWidth={2}
                    fill="url(#fillOrdenes)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm xl:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Órdenes por estado</CardTitle>
              <CardDescription>Hoy — distribución referencial</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer
                config={{
                  count: { label: "Cantidad", color: "hsl(var(--primary))" },
                }}
                className="aspect-[4/3] w-full min-h-[200px] max-h-[280px]"
              >
                <BarChart
                  layout="vertical"
                  data={dashboardOrderStatusBreakdown}
                  margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
                  accessibilityLayer
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={108}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                    {dashboardOrderStatusBreakdown.map((_, i) => (
                      <Cell key={dashboardOrderStatusBreakdown[i].key} fill={breakdownColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Alertas recientes</CardTitle>
                <CardDescription>Eventos que requieren atención</CardDescription>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Bell className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {dashboardAlerts.map((a, idx) => {
                const Icon = alertIcon[a.type];
                return (
                  <div key={a.id}>
                    {idx > 0 ? <Separator className="my-3" /> : null}
                    <div
                      className={cn(
                        "flex gap-3 rounded-lg border border-l-4 border-border/60 py-2.5 pl-3 pr-2",
                        alertAccent[a.type],
                      )}
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-foreground/80" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug text-foreground">{a.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{a.timeLabel}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Rutas en curso</CardTitle>
                <CardDescription>Avance de paradas por ruta activa</CardDescription>
              </div>
              <Link to="/rutas">
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:text-primary-hover">
                  Ver todas
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardActiveRoutes.map((r) => {
                const pct = Math.round((r.stopsDone / r.stopsTotal) * 100);
                return (
                  <div key={r.id} className="rounded-xl border border-border/70 bg-surface-muted/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {r.id}
                          </Badge>
                          <span className="truncate text-sm font-semibold text-foreground">{r.name}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{r.vehiclePlate}</span>
                          {" · "}
                          Paradas {r.stopsDone}/{r.stopsTotal}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">{pct}%</span>
                    </div>
                    <Progress value={pct} className="mt-2.5 h-2 bg-white" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Accesos rápidos
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { to: "/rutas", label: "Rutas", desc: "Planificación", icon: Navigation },
              { to: "/ordenes", label: "Órdenes", desc: "Entregas", icon: Package },
              { to: "/vehiculos", label: "Vehículos", desc: "Flota", icon: Truck },
              { to: "/flota", label: "Flota en vivo", desc: "Mapa", icon: MapPin },
            ].map(({ to, label, desc, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-primary/35 hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary transition-transform group-hover:scale-105">
                  <Icon className="size-5" />
                </div>
                <p className="mt-3 font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Abrir <ArrowRight className="size-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
