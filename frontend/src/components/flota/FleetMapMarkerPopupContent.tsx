import { ExternalLink, MapPin } from "lucide-react";
import type { FleetDevice } from "@/domain/fleet";
import { formatFleetDateTime } from "@/lib/fleetDateTime";
import { fleetStatusLabels } from "@/domain/fleet";
import { cn } from "@/lib/utils";

interface Props {
  device: FleetDevice;
}

function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** Detalle completo de la unidad en el globo del mapa (no en el lateral). */
const FleetMapMarkerPopupContent = ({ device: d }: Props) => {
  const speedStr = `${Number.isFinite(d.speedKmh) ? d.speedKmh.toFixed(2) : "0.00"} km/h`;

  return (
    <div className="fleet-map-popup-inner text-[13px] leading-snug text-foreground">
      <p className="pr-6 text-base font-bold tracking-tight">{d.plate}</p>
      {d.alias ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{d.alias}</p> : null}
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{d.imei}</p>

      <div className="mt-2">
        <span
          className={cn(
            "inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase",
            d.status === "in_route" && "bg-success-soft text-success",
            d.status === "stopped" && "bg-warning-soft text-warning",
            d.status === "offline" && "bg-muted text-muted-foreground",
          )}
        >
          {fleetStatusLabels[d.status]}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 border-t border-border/50 pt-3 text-xs">
        <dt className="text-muted-foreground">Velocidad</dt>
        <dd className="font-mono font-medium tabular-nums">{speedStr}</dd>
        <dt className="text-muted-foreground">Coordenadas</dt>
        <dd className="font-mono tabular-nums">
          {d.lat.toFixed(5)}, {d.lng.toFixed(5)}
        </dd>
        <dt className="text-muted-foreground">Batería</dt>
        <dd className="font-medium tabular-nums">{d.batteryPct}%</dd>
        <dt className="text-muted-foreground">Señal</dt>
        <dd className="font-medium tabular-nums">{d.signalBars} / 4</dd>
        <dt className="text-muted-foreground">Último reporte</dt>
        <dd className="text-[11px] leading-snug">
          {formatFleetDateTime(d.lastSeenIso, "EEEE d MMM yyyy, HH:mm:ss")}
        </dd>
      </dl>

      <a
        href={mapsUrl(d.lat, d.lng)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/80"
      >
        <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
        Google Maps
        <ExternalLink className="size-3 shrink-0 opacity-60" aria-hidden />
      </a>
    </div>
  );
};

export default FleetMapMarkerPopupContent;
