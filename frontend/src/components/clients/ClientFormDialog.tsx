import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type Client,
  type ClientWriteBody,
  nombreCatalogoIiieeRegionalDesdeCampos,
  nombreInstitucionYNivelCliente,
} from "@/domain/clients";
import { clientsApi } from "@/services/clients.api";
import { errorMessageFromUnknown } from "@/lib/utils";
import { parseCoordClienteApi } from "@/lib/clienteFormMap";
import { useClientFormUbicacionMap } from "@/hooks/useClientFormUbicacionMap";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { ClienteMaplibreUbicacion } from "@/components/clients/ClienteMaplibreUbicacion";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Client | null;
};

export default function ClientFormDialog({ open, onOpenChange, editing }: Props) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nombreApellidosDirectorIiee, setNombreApellidosDirectorIiee] = useState("");
  const [activo, setActivo] = useState(true);
  const [codigoRegional, setCodigoRegional] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [provincia, setProvincia] = useState("");
  const [distrito, setDistrito] = useState("");
  const [ugel, setUgel] = useState("");
  const [centroPoblado, setCentroPoblado] = useState("");
  const [direccion, setDireccion] = useState("");
  const [codigoModularIiee, setCodigoModularIiee] = useState("");
  const [nivelEducacion, setNivelEducacion] = useState("");
  const [latitud, setLatitud] = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);
  const [ubicacionMapaLimpiar, setUbicacionMapaLimpiar] = useState(false);

  const hydrateFormFromEditing = useCallback((client: Client | null) => {
    if (client) {
      setEmail(client.email ?? "");
      setTelefono(client.telefono ?? "");
      setNombreApellidosDirectorIiee(client.nombreApellidosDirectorIiee ?? "");
      setActivo(Boolean(client.activo));
      setCodigoRegional(client.codigoRegional ?? "");
      setDepartamento(client.departamento ?? "");
      setProvincia(client.provincia ?? "");
      setDistrito(client.distrito ?? "");
      setUgel(client.ugel ?? "");
      setCentroPoblado(client.centroPoblado ?? "");
      setDireccion(client.direccion ?? "");
      setLatitud(parseCoordClienteApi(client.latitud));
      setLongitud(parseCoordClienteApi(client.longitud));
      setUbicacionMapaLimpiar(false);
      setCodigoModularIiee(client.codigoModularIiee ?? "");
      const nRaw = (client.nivelEducacion ?? "").trim();
      if (!nRaw) setNivelEducacion("");
      else {
        const u = nRaw.toUpperCase();
        if (u === "PRIMARIA" || u === "SECUNDARIA") setNivelEducacion(u);
        else setNivelEducacion(nRaw);
      }
    } else {
      setEmail("");
      setTelefono("");
      setNombreApellidosDirectorIiee("");
      setActivo(true);
      setCodigoRegional("");
      setDepartamento("");
      setProvincia("");
      setDistrito("");
      setUgel("");
      setCentroPoblado("");
      setDireccion("");
      setLatitud(null);
      setLongitud(null);
      setUbicacionMapaLimpiar(false);
      setCodigoModularIiee("");
      setNivelEducacion("");
    }
  }, []);

  const { mapSession, mapSessionKey, buscandoDireccion, buscarDireccionPorTexto } = useClientFormUbicacionMap({
    open,
    editing,
    direccion,
    setDireccion,
    latitud,
    longitud,
    setLatitud,
    setLongitud,
    setUbicacionMapaLimpiar,
    hydrateFormFromEditing,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["clientes"] });
    if (editing?.id) {
      void qc.invalidateQueries({ queryKey: ["clientes", "detalle", editing.id] });
      void qc.invalidateQueries({ queryKey: ["clientes", editing.id, "ordenes"] });
    }
  };

  const createMut = useMutation({
    mutationFn: (body: ClientWriteBody) => clientsApi.create(body),
    onSuccess: () => {
      invalidate();
      toast.success("Cliente creado.");
      onOpenChange(false);
    },
    onError: (e: unknown) => toast.error(errorMessageFromUnknown(e, "No se pudo crear el cliente.")),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ClientWriteBody }) => clientsApi.update(id, body),
    onSuccess: () => {
      invalidate();
      toast.success("Cliente actualizado.");
      onOpenChange(false);
    },
    onError: (e: unknown) => toast.error(errorMessageFromUnknown(e, "No se pudo actualizar el cliente.")),
  });

  const busy = createMut.isPending || updateMut.isPending;

  const regionalBody = (): Pick<
    ClientWriteBody,
    | "codigoRegional"
    | "departamento"
    | "provincia"
    | "distrito"
    | "ugel"
    | "centroPoblado"
    | "direccion"
    | "codigoModularIiee"
    | "nivelEducacion"
  > => ({
    codigoRegional: codigoRegional.trim() || undefined,
    departamento: departamento.trim() || undefined,
    provincia: provincia.trim() || undefined,
    distrito: distrito.trim() || undefined,
    ugel: ugel.trim() || undefined,
    centroPoblado: centroPoblado.trim() || undefined,
    direccion: direccion.trim() || undefined,
    codigoModularIiee: codigoModularIiee.trim() || undefined,
    nivelEducacion: nivelEducacion.trim() || undefined,
  });

  const submit = () => {
    const nombreArmado = nombreCatalogoIiieeRegionalDesdeCampos({
      nombreInstitucion: editing
        ? nombreInstitucionYNivelCliente(editing.nombre).nombreInstitucion || undefined
        : undefined,
      centroPoblado: centroPoblado,
      codigoModularIiee: codigoModularIiee,
      ugel: ugel,
      codigoRegional: codigoRegional,
      nivelEducacion: nivelEducacion,
    });
    if (!nombreArmado.trim()) {
      toast.error(
        "Indicá al menos centro poblado, IIEE, UGEL o código regional para armar el nombre del cliente (como en el Excel).",
      );
      return;
    }
    const body: ClientWriteBody = {
      nombre: nombreArmado,
      email: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      nombreApellidosDirectorIiee: nombreApellidosDirectorIiee.trim() || undefined,
      ...regionalBody(),
      activo,
      ...(editing && ubicacionMapaLimpiar
        ? { ubicacionMapaLimpiar: true }
        : latitud != null && longitud != null
          ? { latitud, longitud }
          : {}),
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, body });
    } else {
      createMut.mutate(body);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-5xl [&>button]:hidden">
        <div className="flex max-h-[inherit] flex-col">
          <header className="shrink-0 border-b border-border px-5 py-4">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {editing ? "Editar cliente" : "Nuevo cliente"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              Completa los datos del cliente. Los campos con * son obligatorios.
            </DialogDescription>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              
              {/* Sección: Datos Institucionales */}
              <section className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Datos Institucionales
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-codigo">Código *</Label>
                    <Input 
                      id="cli-codigo" 
                      value={codigoRegional} 
                      onChange={(e) => setCodigoRegional(e.target.value)} 
                      placeholder="Ej: 1501"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-iiee">IIEE (Código Modular)</Label>
                    <Input 
                      placeholder="Ej: 003350" 
                      id="cli-iiee" 
                      value={codigoModularIiee} 
                      onChange={(e) => setCodigoModularIiee(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-centro">Centro Poblado</Label>
                    <Input 
                      id="cli-centro" 
                      value={centroPoblado} 
                      onChange={(e) => setCentroPoblado(e.target.value)} 
                      placeholder="Nombre del centro poblado"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-nivel-select">Nivel Educativo</Label>
                    <Select
                      value={nivelEducacion === "" ? "__sin_nivel__" : nivelEducacion}
                      onValueChange={(v) => setNivelEducacion(v === "__sin_nivel__" ? "" : v)}
                    >
                      <SelectTrigger id="cli-nivel-select">
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="__sin_nivel__">—</SelectItem>
                        <SelectItem value="PRIMARIA">Primaria</SelectItem>
                        <SelectItem value="SECUNDARIA">Secundaria</SelectItem>
                        {nivelEducacion &&
                        nivelEducacion !== "PRIMARIA" &&
                        nivelEducacion !== "SECUNDARIA" ? (
                          <SelectItem value={nivelEducacion}>{nivelEducacion}</SelectItem>
                        ) : null}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Sección: Ubicación Geográfica */}
              <section className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Ubicación Geográfica
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-depto">Departamento</Label>
                    <Input 
                      id="cli-depto" 
                      value={departamento} 
                      onChange={(e) => setDepartamento(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-prov">Provincia</Label>
                    <Input 
                      id="cli-prov" 
                      value={provincia} 
                      onChange={(e) => setProvincia(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-dist">Distrito</Label>
                    <Input 
                      id="cli-dist" 
                      value={distrito} 
                      onChange={(e) => setDistrito(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-ugel">UGEL</Label>
                    <Input 
                      id="cli-ugel" 
                      value={ugel} 
                      onChange={(e) => setUgel(e.target.value)} 
                    />
                  </div>
                </div>
              </section>

              {/* Sección: Dirección y Mapa */}
              <section className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4 sm:col-span-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Dirección y Ubicación
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="cli-dir">Dirección</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cli-dir"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        maxLength={300}
                        placeholder="Dirección o búsqueda (Perú, Nominatim)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void buscarDireccionPorTexto();
                          }
                        }}
                        className="min-w-0 flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="shrink-0"
                        disabled={buscandoDireccion}
                        aria-label="Buscar dirección en el mapa"
                        title="Buscar dirección (Perú)"
                        onClick={() => void buscarDireccionPorTexto()}
                      >
                        {buscandoDireccion ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Search className="size-4" aria-hidden />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] leading-snug text-muted-foreground">
                      Buscá por texto (mín. 4 caracteres, resultados en Perú) o ubicá con el mapa debajo; Enter también busca.
                    </p>
                  </div>
                  
                  {open && mapSession ? (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Ubicación en mapa
                      </Label>
                      <ClienteMaplibreUbicacion
                        sessionKey={mapSessionKey}
                        mode="edit"
                        initialLat={latitud}
                        initialLng={longitud}
                        onLocationResolved={(la, ln, dirReal) => {
                          setUbicacionMapaLimpiar(false);
                          setLatitud(la);
                          setLongitud(ln);
                          if (dirReal) setDireccion(dirReal);
                        }}
                        onClearLocation={() => {
                          setLatitud(null);
                          setLongitud(null);
                          setUbicacionMapaLimpiar(true);
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </section>

              {/* Sección: Contacto del Director */}
              <section className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Contacto del Director
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-dir-nombre" className="whitespace-pre-line leading-snug">
                      Nombres y Apellidos
                    </Label>
                    <Input
                      id="cli-dir-nombre"
                      value={nombreApellidosDirectorIiee}
                      onChange={(e) => setNombreApellidosDirectorIiee(e.target.value)}
                      placeholder="Nombre completo del director"
                      maxLength={200}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-mail">Email</Label>
                    <Input 
                      id="cli-mail" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      autoComplete="off"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cli-tel">Teléfono</Label>
                    <Input 
                      id="cli-tel" 
                      value={telefono} 
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+51 999 999 999" 
                    />
                  </div>
                </div>
              </section>

              {/* Sección: Estado */}
              <section className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Estado
                </h3>
                <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-4 py-3">
                  <Checkbox 
                    id="cli-activo" 
                    checked={activo} 
                    onCheckedChange={(v) => setActivo(Boolean(v))} 
                  />
                  <Label htmlFor="cli-activo" className="cursor-pointer font-normal text-sm">
                    Cliente activo
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Los clientes inactivos no aparecerán en las listas de selección al crear órdenes.
                </p>
              </section>

            </div>
          </div>

          <footer className="shrink-0 border-t border-border bg-muted/30 px-5 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="h-10 w-full sm:w-auto sm:min-w-[120px]"
                onClick={() => onOpenChange(false)} 
                disabled={busy}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                size="sm"
                className="h-10 w-full bg-primary text-primary-foreground hover:bg-primary-hover sm:w-auto sm:min-w-[140px]"
                onClick={() => submit()} 
                disabled={busy}
              >
                {busy ? <Loader2 className="size-4 animate-spin mr-2" aria-hidden /> : null}
                {busy ? "Guardando…" : "Guardar cliente"}
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
