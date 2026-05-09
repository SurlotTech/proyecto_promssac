import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { vehicles, statusMeta } from "@/data/vehicles";
import { Badge } from "@/components/ui/badge";
import L from "leaflet";

// Fix default icon issue with vite/webpack
// @ts-expect-error _getIconUrl is an internal property
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const FleetLiveMap = () => {
  // Center of Lima
  const center = { lat: -12.0464, lng: -77.0428 };

  const activeVehicles = vehicles.filter((v) => v.status === "in_route" || v.status === "active");

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Flota en vivo</h3>
          <p className="text-xs text-muted-foreground">Ubicación actual de vehículos activos</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
          <span className="mr-1.5 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          En vivo
        </Badge>
      </div>
      <div className="h-[300px] w-full overflow-hidden rounded-lg border border-border relative z-0">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {activeVehicles.map((vehicle) => (
            <Marker key={vehicle.id} position={[vehicle.lat, vehicle.lng]}>
              <Popup>
                <div className="p-0.5 min-w-[120px]">
                  <p className="font-bold text-sm text-foreground">{vehicle.plate}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{vehicle.driver}</p>
                  <div className="flex gap-2 mt-2.5">
                    <Badge variant="outline" className="text-[10px] font-medium">{vehicle.speed} km/h</Badge>
                    <Badge variant="secondary" className="text-[10px] font-medium bg-info-soft text-info hover:bg-info-soft">
                      {statusMeta[vehicle.status as keyof typeof statusMeta].label}
                    </Badge>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default FleetLiveMap;
