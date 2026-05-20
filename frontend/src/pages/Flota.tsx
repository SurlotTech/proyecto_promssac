import { Crosshair, MapPin, Zap, ZapOff } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { gpsApi } from "@/services";
import FlotaLiveMap from "@/components/flota/FlotaLiveMap";
import { useWakeLock } from "@/hooks/useWakeLock";

const FLOTA_POLL_KEY = ["flota", "ubicaciones"];

const Flota = () => {
  const {
    data: ubicaciones = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: FLOTA_POLL_KEY,
    queryFn: () => gpsApi.listarUbicaciones(),
    refetchInterval: 10000,
  });

  const wakeLock = useWakeLock();
  const activos = ubicaciones.length;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-transparent animate-fade-in">
      <PageHeader
        title="Flota en vivo"
        subtitle="Monitoreo de ubicaciones en tiempo real."
        actions={
          <div className="flex items-center gap-3">
            {wakeLock.isSupported && (
              <button
                type="button"
                onClick={wakeLock.isActive ? wakeLock.release : wakeLock.acquire}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              >
                {wakeLock.isActive ? (
                  <>
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="text-primary">Pantalla activa</span>
                  </>
                ) : (
                  <>
                    <ZapOff className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Pantalla activa</span>
                  </>
                )}
              </button>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {activos} usuario{activos !== 1 ? "s" : ""} activo
                {activos !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        }
      />

      <div className="relative flex min-h-0 flex-1 flex-col mx-4 mb-4 sm:mx-6 lg:mx-8">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-border/80 bg-muted p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Crosshair className="h-7 w-7 animate-pulse text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                Cargando mapa…
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-border/80 bg-muted p-8 text-center">
            <div className="max-w-sm space-y-3">
              <p className="text-sm font-medium text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Error al cargar ubicaciones"}
              </p>
            </div>
          </div>
        ) : (
          <FlotaLiveMap ubicaciones={ubicaciones} />
        )}

        <p className="pointer-events-none absolute bottom-3 right-3 z-[500] rounded-md bg-background/95 px-2 py-1 text-[10px] text-muted-foreground shadow backdrop-blur-sm">
          Se actualiza cada 10 s
        </p>
      </div>
    </div>
  );
};

export default Flota;
