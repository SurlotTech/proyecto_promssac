import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  MapPin,
  Package,
  Plus,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RouteDateRangePicker from "@/components/routes/RouteDateRangePicker";
import { places, routePriorityMeta } from "@/data/routes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  clearOrderDraft,
  persistOrderDraft,
  readOrderDraft,
  type OrderCompletarLocationState,
  type OrderCreationDraft,
  type OrderProductsLocationState,
} from "@/lib/orderCreationDraft";

const selectTriggerClass =
  "h-9 w-full border-border/80 bg-background px-3 text-sm shadow-sm transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:ring-offset-0 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span]:font-semibold [&>span]:text-foreground [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-muted-foreground";

const fieldInputClass =
  "h-9 border-border/80 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-ring";

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {children}
      </h2>
      <Separator className="flex-1" />
    </div>
  );
}

function InfoHint({ text, label }: { text: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-info hover:bg-info-soft"
          aria-label={label}
        >
          <Info className="size-4" strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-xs leading-snug">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

const customFieldKeys = [
  "director",
  "cajaM",
  "cajaS",
  "cajaAc",
  "actaEntrega",
  "guiaRemision",
  "guiaTransportista",
] as const;

const customFieldLabels: Record<(typeof customFieldKeys)[number], string> = {
  director: "Director",
  cajaM: "Caja M",
  cajaS: "Caja S",
  cajaAc: "Caja AC",
  actaEntrega: "Acta de entrega",
  guiaRemision: "Guía de remisión",
  guiaTransportista: "Guía de transportista",
};

type RoutePriority = keyof typeof routePriorityMeta;

const CompletarOrden = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [draft, setDraft] = useState<OrderCreationDraft | null>(null);

  const [deliveryFrom, setDeliveryFrom] = useState("");
  const [deliveryTo, setDeliveryTo] = useState("");
  const [groupPlace, setGroupPlace] = useState("");
  const [mode, setMode] = useState("default");
  const [priority, setPriority] = useState<RoutePriority>("medium");
  const [cod, setCod] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactIdentifier, setContactIdentifier] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [addressLine, setAddressLine] = useState("");
  const [normalizedAddress, setNormalizedAddress] = useState("");
  const [serviceMinutes, setServiceMinutes] = useState("15");
  const [addressReference, setAddressReference] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [customFields, setCustomFields] = useState<Record<(typeof customFieldKeys)[number], string>>(
    () =>
      Object.fromEntries(customFieldKeys.map((k) => [k, ""])) as Record<
        (typeof customFieldKeys)[number],
        string
      >,
  );

  useEffect(() => {
    const state = location.state as OrderCompletarLocationState | null;
    const fromNav = state?.orderDraft;
    const fromStorage = readOrderDraft();
    const d = fromNav ?? fromStorage;
    if (!d?.displayOrderId) {
      toast.error("No hay datos de orden. Crea una orden primero.");
      navigate("/ordenes", { replace: true });
      return;
    }
    setDraft(d);
    if (fromNav) persistOrderDraft(fromNav);
  }, [location, navigate]);

  const lowAddressConfidence = useMemo(() => {
    const t = addressLine.trim();
    return t.length > 0 && t.length < 12;
  }, [addressLine]);

  const handleBack = () => {
    navigate("/ordenes");
  };

  const requiredOk =
    Boolean(draft?.displayOrderId) &&
    deliveryFrom &&
    deliveryTo &&
    mode &&
    contactName.trim() &&
    addressLine.trim();

  const handleSave = () => {
    if (!requiredOk) {
      toast.error("Completa los campos obligatorios marcados con *.");
      return;
    }
    clearOrderDraft();
    toast.success(`Orden ${draft!.displayOrderId} guardada con los datos de contacto.`);
    navigate("/ordenes", { replace: true });
  };

  const handleGeocodeDemo = () => {
    const t = addressLine.trim();
    if (!t) {
      toast.message("Escribe una dirección o referencia primero.");
      return;
    }
    setNormalizedAddress(
      t.length >= 8
        ? `${t} — dirección normalizada (demo)`
        : "Dirección incompleta para geocodificar (demo).",
    );
    setLat("-12.0464");
    setLng("-77.0428");
  };

  if (!draft) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-start gap-3 sm:items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg text-foreground hover:bg-muted"
            onClick={handleBack}
            aria-label="Volver a órdenes"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Completar datos de la orden
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Rellena los detalles de la orden.{" "}
              <span className="whitespace-nowrap">
                <span className="font-semibold text-primary">*</span> Indica que el campo es obligatorio.
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
          {draft.routeLabel ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Ruta asignada:</span> {draft.routeLabel}
            </p>
          ) : null}

          {/* Datos de la orden */}
          <section className="space-y-4">
            <SectionTitle>Datos de la orden</SectionTitle>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="co-order-id" className="text-xs text-muted-foreground">
                  Número de la orden <span className="text-primary">*</span>
                </Label>
                <Input
                  id="co-order-id"
                  readOnly
                  value={draft.displayOrderId}
                  className={cn(fieldInputClass, "bg-muted/40 tabular-nums")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Fecha de entrega <span className="text-primary">*</span>
                </Label>
                <RouteDateRangePicker
                  dateFrom={deliveryFrom}
                  dateTo={deliveryTo}
                  onRangeChange={(from, to) => {
                    setDeliveryFrom(from);
                    setDeliveryTo(to);
                  }}
                  className="w-full min-w-0 lg:max-w-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Grupos asociados</Label>
                <Select value={groupPlace || undefined} onValueChange={setGroupPlace}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Seleccionar grupo" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {places.map((p) => (
                      <SelectItem key={p} value={p} className="text-sm">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Modo <span className="text-primary">*</span>
                </Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Seleccionar modo" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="default" className="text-sm">
                      Por defecto
                    </SelectItem>
                    <SelectItem value="express" className="text-sm">
                      Express
                    </SelectItem>
                    <SelectItem value="consolidated" className="text-sm">
                      Consolidado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:max-w-md">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Prioridad</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as RoutePriority)}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {(Object.keys(routePriorityMeta) as (keyof typeof routePriorityMeta)[]).map((k) => (
                      <SelectItem key={k} value={k} className="text-sm">
                        {routePriorityMeta[k].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5 sm:gap-3">
              <Checkbox
                id="co-cod"
                checked={cod}
                onCheckedChange={(c) => setCod(c === true)}
              />
              <Label htmlFor="co-cod" className="cursor-pointer text-sm font-medium text-foreground">
                Pago contra entrega
              </Label>
              <InfoHint
                label="Información sobre pago contra entrega"
                text="Indica si el receptor debe pagar el monto de la mercadería al momento de la entrega."
              />
            </div>
          </section>

          {/* Datos de contacto */}
          <section className="space-y-4">
            <SectionTitle>Datos de contacto</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="co-contact-name" className="text-xs text-muted-foreground">
                  Nombre del contacto <span className="text-primary">*</span>
                </Label>
                <Input
                  id="co-contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nombre completo"
                  className={fieldInputClass}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-phone" className="text-xs text-muted-foreground">
                  Teléfono
                </Label>
                <Input
                  id="co-phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+51 999 999 999"
                  className={cn(fieldInputClass, "tabular-nums")}
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-identifier" className="text-xs text-muted-foreground">
                  Identificador de contacto
                </Label>
                <Input
                  id="co-identifier"
                  value={contactIdentifier}
                  onChange={(e) => setContactIdentifier(e.target.value)}
                  placeholder="DNI, RUC u otro"
                  className={fieldInputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-email" className="text-xs text-muted-foreground">
                  Correo electrónico
                </Label>
                <Input
                  id="co-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={fieldInputClass}
                  autoComplete="email"
                />
              </div>
            </div>
          </section>

          {/* Dirección y mapa */}
          <section className="space-y-4">
            <SectionTitle>Dirección de envío</SectionTitle>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="min-w-0 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="co-address" className="text-xs text-muted-foreground">
                    Dirección o referencia <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="co-address"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      onBlur={handleGeocodeDemo}
                      placeholder="Ej: Jr. Las Micas 250, San Juan de Lurigancho"
                      className={cn(fieldInputClass, "pr-10")}
                    />
                    <button
                      type="button"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Geocodificar dirección (demo)"
                      onClick={handleGeocodeDemo}
                    >
                      <MapPin className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-norm" className="text-xs text-muted-foreground">
                    Dirección normalizada
                  </Label>
                  <Input
                    id="co-norm"
                    readOnly
                    value={normalizedAddress}
                    placeholder="Se completará al validar la dirección"
                    className={cn(fieldInputClass, "bg-muted/40")}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="co-svc" className="text-xs text-muted-foreground">
                      Tiempo de servicio (minutos)
                    </Label>
                    <Input
                      id="co-svc"
                      type="number"
                      min={0}
                      value={serviceMinutes}
                      onChange={(e) => setServiceMinutes(e.target.value)}
                      className={cn(fieldInputClass, "tabular-nums")}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="co-ref" className="text-xs text-muted-foreground">
                      Referencia
                    </Label>
                    <Textarea
                      id="co-ref"
                      value={addressReference}
                      onChange={(e) => setAddressReference(e.target.value)}
                      placeholder="Indicaciones adicionales para el conductor"
                      rows={3}
                      className="min-h-[5.5rem] resize-y border-border/80 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="co-lat" className="text-xs text-muted-foreground">
                      Latitud
                    </Label>
                    <Input
                      id="co-lat"
                      readOnly
                      value={lat}
                      placeholder="—"
                      className={cn(fieldInputClass, "bg-muted/40 font-mono text-xs tabular-nums")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="co-lng" className="text-xs text-muted-foreground">
                      Longitud
                    </Label>
                    <Input
                      id="co-lng"
                      readOnly
                      value={lng}
                      placeholder="—"
                      className={cn(fieldInputClass, "bg-muted/40 font-mono text-xs tabular-nums")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm sm:min-h-[280px] lg:min-h-[320px]">
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <MapPin className="size-6" strokeWidth={1.75} />
                  </div>
                  <p className="text-sm font-medium text-foreground">Vista de mapa</p>
                  <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                    Aquí integrarías tu mapa (Leaflet, Mapbox, Google). En esta demo solo se simula la
                    geocodificación con el botón o al salir del campo de dirección.
                  </p>
                </div>
              </div>
            </div>

            {lowAddressConfidence ? (
              <Alert
                className="border-warning/50 bg-warning-soft/80 text-warning-foreground [&>svg]:text-warning"
                variant="default"
              >
                <TriangleAlert className="size-4" aria-hidden />
                <AlertTitle className="text-warning">Baja confiabilidad de la dirección</AlertTitle>
                <AlertDescription className="text-sm text-foreground/90">
                  Revisa los datos para mejorar la precisión. Puedes contactar al cliente para que corrija su
                  dirección.
                </AlertDescription>
              </Alert>
            ) : null}
          </section>

          {/* Campos personalizados */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Campos personalizados
              </h2>
              <InfoHint
                label="Campos personalizados"
                text="Campos adicionales definidos por tu operación (documentos, cajas, guías, etc.)."
              />
              <Separator className="min-w-[2rem] flex-1" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {customFieldKeys.map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`cf-${key}`} className="text-xs text-muted-foreground">
                    {customFieldLabels[key]}
                  </Label>
                  <Input
                    id={`cf-${key}`}
                    value={customFields[key]}
                    onChange={(e) =>
                      setCustomFields((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className={fieldInputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Acciones */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" size="sm" className="h-10 w-full sm:w-auto" onClick={handleBack}>
              Cancelar
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-full gap-2 border-primary/40 text-primary hover:bg-primary-soft sm:w-auto"
                onClick={() => {
                  const state: OrderProductsLocationState = {
                    displayOrderId: draft.displayOrderId,
                  };
                  navigate("/ordenes/productos", { state });
                }}
              >
                <Plus className="size-4 shrink-0" />
                Agregar productos
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-10 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto sm:min-w-[140px]"
                onClick={handleSave}
                disabled={!requiredOk}
              >
                <Package className="size-4 shrink-0" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletarOrden;
