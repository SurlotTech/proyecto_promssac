import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LIMA_CENTER } from "@/domain/fleet";
import { setupLeafletDefaultIcons } from "@/components/completarOrden/leafletSetup";

setupLeafletDefaultIcons();

function MapClick({
  onLocationCommit,
}: {
  onLocationCommit: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationCommit(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface Props {
  lat: string;
  lng: string;
  /** Coloca o mueve el marcador y actualiza dirección (geocodificación inversa en el padre). */
  onLocationCommit: (lat: number, lng: number) => void;
}

const CompletarOrdenAddressMap = ({ lat, lng, onLocationCommit }: Props) => {
  const hasCoords = Boolean(lat?.trim() && lng?.trim());
  const latNum = hasCoords ? parseFloat(lat) : LIMA_CENTER[0];
  const lngNum = hasCoords ? parseFloat(lng) : LIMA_CENTER[1];
  const center: [number, number] = [latNum, lngNum];

  return (
    <div className="relative flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-muted shadow-sm sm:min-h-[280px] lg:min-h-[320px]">
      <MapContainer center={center} zoom={hasCoords ? 17 : 13} className="z-0 h-full min-h-[220px] w-full sm:min-h-[280px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[latNum, lngNum]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = e.target.getLatLng();
              onLocationCommit(p.lat, p.lng);
            },
          }}
        />
        <MapClick onLocationCommit={onLocationCommit} />
      </MapContainer>
      <div className="pointer-events-none absolute bottom-2 right-2 z-[400] rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">
        Arrastra el pin o pulsa el mapa · OpenStreetMap / Nominatim
      </div>
    </div>
  );
};

export default CompletarOrdenAddressMap;
