import { Loader2, MapPin, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CompletarOrdenAddressMap from "@/components/completarOrden/CompletarOrdenAddressMap";
import { fieldInputClass } from "@/lib/completarOrden/constants";
import { cn } from "@/lib/utils";

interface Props {
  addressLine: string;
  onAddressLineChange: (v: string) => void;
  normalizedAddress: string;
  serviceMinutes: string;
  onServiceMinutesChange: (v: string) => void;
  addressReference: string;
  onAddressReferenceChange: (v: string) => void;
  lat: string;
  lng: string;
  geocodificando: boolean;
  lowAddressConfidence: boolean;
  /** Geocodificación directa (Nominatim) a partir del texto del campo. */
  onBuscarPorTexto: () => void | Promise<void>;
  /** Pin arrastrado o clic en mapa → inversa y relleno de dirección. */
  onMapLocationCommit: (lat: number, lng: number) => void | Promise<void>;
}

const StepDireccion = ({
  addressLine,
  onAddressLineChange,
  normalizedAddress,
  serviceMinutes,
  onServiceMinutesChange,
  addressReference,
  onAddressReferenceChange,
  lat,
  lng,
  geocodificando,
  lowAddressConfidence,
  onBuscarPorTexto,
  onMapLocationCommit,
}: Props) => (
  <div className="space-y-6">
    <p className="text-xs leading-relaxed text-muted-foreground">
      La dirección de entrega sale del <strong className="text-foreground">mapa</strong> (arrastra el pin o pulsa el
      mapa). El texto del DNI/RUC no se copia aquí. Puedes buscar por escrito con el ícono{" "}
      <MapPin className="inline size-3.5 align-text-bottom" strokeWidth={2} />.
    </p>

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
              onChange={(e) => onAddressLineChange(e.target.value)}
              placeholder="Se rellena desde el mapa o búsqueda"
              className={cn(fieldInputClass, "pr-10")}
              disabled={geocodificando}
            />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
              aria-label="Buscar esta dirección en el mapa"
              disabled={geocodificando}
              onClick={() => void onBuscarPorTexto()}
            >
              {geocodificando ? (
                <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
              ) : (
                <MapPin className="size-4" />
              )}
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
            placeholder="Coincide con la dirección resuelta (Nominatim)"
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
              onChange={(e) => onServiceMinutesChange(e.target.value)}
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
              onChange={(e) => onAddressReferenceChange(e.target.value)}
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

      <div className={cn("relative min-h-[220px]", geocodificando && "pointer-events-none opacity-70")}>
        <CompletarOrdenAddressMap lat={lat} lng={lng} onLocationCommit={onMapLocationCommit} />
        {geocodificando ? (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center rounded-xl bg-background/40">
            <Loader2 className="size-8 animate-spin text-primary" aria-label="Geocodificando" />
          </div>
        ) : null}
      </div>
    </div>

    {lowAddressConfidence ? (
      <Alert className="border-warning/50 bg-warning-soft/80 text-warning-foreground [&>svg]:text-warning">
        <TriangleAlert className="size-4" aria-hidden />
        <AlertTitle className="text-warning">Baja confiabilidad de la dirección</AlertTitle>
        <AlertDescription className="text-sm text-foreground/90">
          Revisa los datos para mejorar la precisión. Puedes contactar al cliente para que corrija su dirección.
        </AlertDescription>
      </Alert>
    ) : null}
  </div>
);

export default StepDireccion;
