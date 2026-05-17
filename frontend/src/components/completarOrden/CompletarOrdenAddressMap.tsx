import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { PromssacMap } from "@/components/maps";
import { LIMA_CENTER } from "@/domain/fleet";

interface Props {
  lat: string;
  lng: string;
  onLocationCommit: (lat: number, lng: number) => void;
}

const CompletarOrdenAddressMap = ({ lat, lng, onLocationCommit }: Props) => {
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const mapInstRef = useRef<maplibregl.Map | null>(null);

  const hasCoords = Boolean(lat?.trim() && lng?.trim());
  const latNum = hasCoords ? parseFloat(lat) : LIMA_CENTER[0];
  const lngNum = hasCoords ? parseFloat(lng) : LIMA_CENTER[1];

  useEffect(() => {
    const map = mapInstRef.current;
    if (!map) return;

    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ draggable: true })
        .setLngLat([lngNum, latNum])
        .addTo(map);

      markerRef.current.on("dragend", () => {
        const lngLat = markerRef.current?.getLngLat();
        if (lngLat) {
          onLocationCommit(lngLat.lat, lngLat.lng);
        }
      });
    } else {
      markerRef.current.setLngLat([lngNum, latNum]);
    }
  }, [latNum, lngNum, onLocationCommit]);

  return (
    <div className="relative flex h-[450px] w-full flex-col overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
      <PromssacMap
        mapKey="completar-orden-address-map"
        center={[lngNum, latNum]}
        zoom={hasCoords ? 16 : 13}
        showStylePicker={true}
        defaultStyle="liberty"
        className="h-full w-full"
        containerClassName="h-full w-full border-none"
        onMap={(map) => {
          mapInstRef.current = map;
          
          map.on("click", (e) => {
            onLocationCommit(e.lngLat.lat, e.lngLat.lng);
          });

          // Sync initial marker
          if (!markerRef.current) {
            markerRef.current = new maplibregl.Marker({ draggable: true })
              .setLngLat([lngNum, latNum])
              .addTo(map);

            markerRef.current.on("dragend", () => {
              const lngLat = markerRef.current?.getLngLat();
              if (lngLat) {
                onLocationCommit(lngLat.lat, lngLat.lng);
              }
            });
          }
        }}
      />
      <div className="pointer-events-none absolute bottom-2 right-12 z-[400] rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
        Arrastra el pin o pulsa el mapa · OpenFreeMap 3D
      </div>
    </div>
  );
};

export default CompletarOrdenAddressMap;
