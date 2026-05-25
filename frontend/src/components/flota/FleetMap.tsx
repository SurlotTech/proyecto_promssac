import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { FleetDevice } from "@/domain/fleet";
import { LIMA_CENTER } from "@/domain/fleet";
import FleetMapMarkerPopupContent from "./FleetMapMarkerPopupContent";

function fleetIcon(selected: boolean) {
  const shadow = selected
    ? "0 0 0 3px white, 0 0 0 5px hsl(358 78% 50%)"
    : "0 2px 10px rgba(0,0,0,0.28)";
  const html = `<div style="width:32px;height:32px;border-radius:50%;background:hsl(358 78% 50%);border:3px solid white;box-shadow:${shadow};display:flex;align-items:center;justify-content:center">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M20 8h-3V4H3v13h2a3 3 0 1 0 4 0h4a3 3 0 1 0 4 0h2v-5l-3-4zM7.5 17.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
</div>`;
  return L.divIcon({
    className: "fleet-leaflet-marker",
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -14],
  });
}

function MapCoordsHUD() {
  const [txt, setTxt] = useState("—");
  useMapEvents({
    mousemove(e) {
      setTxt(`${e.latlng.lat.toFixed(5)} · ${e.latlng.lng.toFixed(5)}`);
    },
  });
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-md bg-black/80 px-2 py-1 text-[10px] tabular-nums text-white shadow-md">
      {txt}
    </div>
  );
}

/** Ajusta vista al listado filtrado o acerca el punto seleccionado */
function MapViewSync({
  devices,
  selectedId,
}: {
  devices: FleetDevice[];
  selectedId: string | null;
}) {
  const map = useMap();
  const listKeyRef = useRef<string>("");
  const lastFlownIdRef = useRef<string | null>(null);

  useEffect(() => {
    const positions = devices.map((d) => [d.lat, d.lng] as [number, number]);
    const listKey = devices
      .map((d) => d.id)
      .sort()
      .join(",");

    if (devices.length === 0) {
      map.setView(LIMA_CENTER, 11);
      listKeyRef.current = listKey;
      lastFlownIdRef.current = null;
      return;
    }

    const selected = selectedId ? devices.find((d) => d.id === selectedId) : undefined;
    if (selected) {
      if (lastFlownIdRef.current !== selected.id) {
        map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 14), { duration: 0.45 });
        lastFlownIdRef.current = selected.id;
      }
      listKeyRef.current = listKey;
      return;
    }

    lastFlownIdRef.current = null;

    if (listKeyRef.current !== listKey) {
      listKeyRef.current = listKey;
      if (positions.length === 1) {
        map.setView(positions[0], 13);
      } else {
        map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 14 });
      }
    }
  }, [map, devices, selectedId]);

  return null;
}

interface Props {
  devices: FleetDevice[];
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
  /** Al cerrar la burbuja del marcador (X), deselecciona si era la unidad activa. */
  onMarkerPopupClose?: (deviceId: string) => void;
}

const FleetMap = ({ devices, selectedId, onMarkerClick, onMarkerPopupClose }: Props) => {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (selectedId) {
      markerRefs.current.get(selectedId)?.openPopup();
    } else {
      markerRefs.current.forEach((m) => m.closePopup());
    }
  }, [selectedId]);

  return (
    <div className="relative flex h-full min-h-[280px] min-w-0 flex-1 flex-col bg-muted">
      <MapContainer
        center={LIMA_CENTER}
        zoom={11}
        className="z-0 h-full min-h-[280px] w-full flex-1 [&_.leaflet-control-zoom]:overflow-hidden [&_.leaflet-control-zoom]:rounded-lg [&_.leaflet-control-zoom]:border-border [&_.leaflet-control-zoom]:shadow-md"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewSync devices={devices} selectedId={selectedId} />
        <MapCoordsHUD />
        {devices.map((d) => (
          <Marker
            key={d.id}
            position={[d.lat, d.lng]}
            icon={fleetIcon(selectedId === d.id)}
            ref={(instance) => {
              if (instance) markerRefs.current.set(d.id, instance);
              else markerRefs.current.delete(d.id);
            }}
            eventHandlers={{
              click: () => onMarkerClick(d.id),
              popupclose: () => onMarkerPopupClose?.(d.id),
            }}
          >
            <Popup className="fleet-map-popup" closeButton minWidth={260} maxWidth={320}>
              <FleetMapMarkerPopupContent device={d} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {devices.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
          <div className="mx-4 max-w-sm rounded-xl border border-border/80 bg-card/95 px-5 py-6 text-center shadow-lg">
            <p className="font-semibold text-foreground">Sin datos de geolocalización</p>
            <p className="mt-2 text-sm text-muted-foreground">
              No hay posiciones para los filtros actuales.
            </p>
          </div>
        </div>
      ) : null}

      <p className="pointer-events-none absolute bottom-3 right-3 z-[500] max-w-[min(90vw,280px)] rounded-md bg-white/95 px-2 py-1 text-center text-[10px] leading-snug text-muted-foreground shadow">
        © OpenStreetMap · Vista referencial Sutrack
      </p>

    </div>
  );
};

export default FleetMap;
