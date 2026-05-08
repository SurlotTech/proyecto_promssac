import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  User,
  Phone,
  Mail,
  Fingerprint,
  Map as MapIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Star,
  Edit2,
  Plus,
  Minus,
  Layers,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DetalleCliente = () => {
  const { id } = useParams();

  // Mock data for the specific client
  const cliente = {
    id: id || "10211",
    nombre: "10211",
    identificador: "28.705-9",
    email: "No disponible",
    telefono: "No disponible",
    stats: {
      cumplimiento: 0,
      entregadas: 0,
      parciales: 0,
      noEntregadas: 0,
    },
    ratings: {
      general: 0,
      transporte: 0,
      servicio: 0,
      producto: 0,
    },
    ordenes: [
      {
        id: "3468820",
        direccion: "EL NARANJO EL NARANJO SALAS LAMBAYEQUE LAMBAYEQUE",
        horaEstimada: "-",
        real: "-",
        estado: "Ingresado al sistema",
      },
    ],
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="flex items-center gap-2 px-6 py-4 text-xs font-medium text-muted-foreground border-b border-border/50">
        <Link to="/clientes" className="hover:text-primary transition-colors">
          Lista de Clientes
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-semibold">Detalles del Cliente</span>
      </div>

      <div className="flex flex-col flex-1 p-6 gap-6">
        {/* Top Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-xl border border-border bg-card shadow-sm relative overflow-hidden">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Nombre
            </label>
            <div className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              <p className="font-bold">{cliente.nombre}</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Identificador de contacto
            </label>
            <div className="flex items-center gap-2">
              <Fingerprint className="size-4 text-muted-foreground" />
              <p className="font-medium">{cliente.identificador || "No disponible"}</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Teléfono
            </label>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              <p className="font-medium">{cliente.telefono}</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <p className="font-medium">{cliente.email}</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-primary/10 text-primary">
            <Edit2 className="size-4" />
          </Button>
        </div>

        {/* Map Section */}
        <div className="flex-1 min-h-[300px] rounded-xl border border-border bg-card shadow-sm relative overflow-hidden group">
          <MapContainer 
            center={[-6.7718, -79.8407]} 
            zoom={13} 
            style={{ height: "100%", width: "100%" }}
            className="z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <Marker position={[-6.7718, -79.8407]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{cliente.nombre}</p>
                  <p className="text-muted-foreground text-xs">{cliente.identificador}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000]">
            <Button size="icon" variant="secondary" className="size-8 shadow-md">
              <Plus className="size-4" />
            </Button>
            <Button size="icon" variant="secondary" className="size-8 shadow-md">
              <Minus className="size-4" />
            </Button>
            <Button size="icon" variant="secondary" className="size-8 shadow-md">
              <Layers className="size-4" />
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-4 gap-4 p-6 rounded-xl border border-border bg-card shadow-sm">
            <StatItem label="Cumplimiento" value={`${cliente.stats.cumplimiento}%`} color="text-primary" />
            <StatItem label="Entregadas" value={`${cliente.stats.entregadas}%`} color="text-success" />
            <StatItem label="Parciales" value={`${cliente.stats.parciales}%`} color="text-warning" />
            <StatItem label="No Entregadas" value={`${cliente.stats.noEntregadas}%`} color="text-destructive" />
          </div>

          <div className="flex items-center justify-between p-6 rounded-xl border border-border bg-card shadow-sm">
            <RatingGroup label="General" stars={cliente.ratings.general} />
            <RatingGroup label="Transporte" stars={cliente.ratings.transporte} />
            <RatingGroup label="Servicio" stars={cliente.ratings.servicio} />
            <RatingGroup label="Producto" stars={cliente.ratings.producto} />
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-4 font-semibold">Orden</th>
                  <th className="px-4 py-4 font-semibold">Dirección</th>
                  <th className="px-4 py-4 font-semibold text-center">Hora estimada</th>
                  <th className="px-4 py-4 font-semibold text-center">Real</th>
                  <th className="px-4 py-4 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cliente.ordenes.map((order) => (
                  <tr key={order.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-4">
                      <Link to={`/ordenes/detalle/${order.id}`} className="font-mono font-bold text-primary hover:underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium max-w-md truncate">
                      {order.direccion}
                    </td>
                    <td className="px-4 py-4 text-center text-muted-foreground">
                      {order.horaEstimada}
                    </td>
                    <td className="px-4 py-4 text-center text-muted-foreground">
                      {order.real}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted/30 px-2 py-0.5 text-[10px] font-medium border border-border">
                        {order.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center border-t border-border p-4 bg-muted/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold shadow-sm">
              1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex flex-col items-center justify-center border-r border-border last:border-0 px-2">
    <p className={cn("text-lg font-black", color)}>{value}</p>
    <p className="text-[10px] font-semibold text-muted-foreground uppercase text-center">{label}</p>
  </div>
);

const RatingGroup = ({ label, stars }: { label: string; stars: number }) => (
  <div className="flex flex-col items-center gap-1">
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{label}</p>
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn("size-3", s <= stars ? "fill-warning text-warning" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  </div>
);

export default DetalleCliente;
