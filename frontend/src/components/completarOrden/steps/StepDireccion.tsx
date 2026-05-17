import { Loader2, MapPin, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CompletarOrdenAddressMap from "@/components/completarOrden/CompletarOrdenAddressMap";
import { fieldInputClass } from "@/lib/completarOrden/constants";
import { cn } from "@/lib/utils";

interface Props {
  contactName: string;
  onContactNameChange: (v: string) => void;
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
  contactName,
  onContactNameChange,
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="co-client" className="text-sm text-muted-foreground">
          Cliente <span className="text-primary">*</span>
        </Label>
        <Input
          id="co-client"
          value={contactName}
          onChange={(e) => onContactNameChange(e.target.value)}
          placeholder="Nombre del cliente"
          className={fieldInputClass}
          autoComplete="name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="co-address" className="text-sm text-muted-foreground">
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
    </div>

    <div className={cn("relative -mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]", geocodificando && "pointer-events-none opacity-70")}>
      <CompletarOrdenAddressMap lat={lat} lng={lng} onLocationCommit={onMapLocationCommit} />
      {geocodificando ? (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center rounded-xl bg-background/40">
          <Loader2 className="size-8 animate-spin text-primary" aria-label="Geocodificando" />
        </div>
      ) : null}
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
