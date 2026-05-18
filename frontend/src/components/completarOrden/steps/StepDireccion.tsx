import { Loader2, MapPin, Search, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CompletarOrdenAddressMap from "@/components/completarOrden/CompletarOrdenAddressMap";
import { fieldInputClass } from "@/lib/completarOrden/constants";
import { cn } from "@/lib/utils";
import type { Client } from "@/domain/clients";

interface Props {
  contactName: string;
  onContactNameChange: (v: string) => void;
  clientSearchQuery: string;
  onClientSearchQueryChange: (v: string) => void;
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
  onBuscarPorTexto: () => void | Promise<void>;
  onMapLocationCommit: (lat: number, lng: number) => void | Promise<void>;
  clientSearchOpen: boolean;
  onClientSearchOpenChange: (open: boolean) => void;
  clientSearchResults: Client[];
  clientSearching: boolean;
  onClientSearch: (query: string) => void;
  onClientSelect: (client: Client) => void;
}

const StepDireccion = ({
  contactName,
  onContactNameChange,
  clientSearchQuery,
  onClientSearchQueryChange,
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
  clientSearchOpen,
  onClientSearchOpenChange,
  clientSearchResults,
  clientSearching,
  onClientSearch,
  onClientSelect,
}: Props) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="co-client" className="text-sm text-muted-foreground">
          Cliente <span className="text-primary">*</span>
        </Label>
        <div className="relative">
          <Input
            id="co-client"
            value={clientSearchQuery}
            onChange={(e) => {
              onClientSearchQueryChange(e.target.value);
              onClientSearch(e.target.value);
            }}
            onFocus={() => {
              if (clientSearchQuery.trim().length >= 2 && clientSearchResults.length > 0) {
                onClientSearchOpenChange(true);
              }
            }}
            onBlur={() => setTimeout(() => onClientSearchOpenChange(false), 200)}
            placeholder="Buscar cliente..."
            className={cn(fieldInputClass, "pr-10")}
            autoComplete="off"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {clientSearching ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Search className="size-4" />
            )}
          </span>
          {clientSearchOpen && clientSearchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
              {clientSearchResults.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="flex w-full flex-col px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onClientSelect(c)}
                >
                  <span className="font-medium text-foreground">{c.nombre}</span>
                  {c.direccion ? (
                    <span className="truncate text-xs text-muted-foreground">{c.direccion}</span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
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
