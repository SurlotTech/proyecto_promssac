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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription className="sr-only">
            {editing ? "Editar datos del cliente" : "Formulario nuevo cliente"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-codigo">CODIGO</Label>
                <Input id="cli-codigo" value={codigoRegional} onChange={(e) => setCodigoRegional(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-depto">DEPARTAMENTO</Label>
                <Input id="cli-depto" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-prov">PROVINCIA</Label>
                <Input id="cli-prov" value={provincia} onChange={(e) => setProvincia(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-dist">DISTRITO</Label>
                <Input id="cli-dist" value={distrito} onChange={(e) => setDistrito(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-ugel">UGEL</Label>
                <Input id="cli-ugel" value={ugel} onChange={(e) => setUgel(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-centro">CENTRO POBLADO</Label>
                <Input id="cli-centro" value={centroPoblado} onChange={(e) => setCentroPoblado(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-dir">DIRECCIÓN</Label>
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
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-iiee">IIEE</Label>
                <Input id="cli-iiee" value={codigoModularIiee} onChange={(e) => setCodigoModularIiee(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-nivel-select">NIVEL</Label>
                <Select
                  value={nivelEducacion === "" ? "__sin_nivel__" : nivelEducacion}
                  onValueChange={(v) => setNivelEducacion(v === "__sin_nivel__" ? "" : v)}
                >
                  <SelectTrigger id="cli-nivel-select">
                    <SelectValue placeholder="Elegí nivel" />
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
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-dir-nombre" className="whitespace-pre-line leading-snug">
                  {"NOMBRES Y APELLIDOS\n(DIRECTOR DE LA IIEE)"}
                </Label>
                <Input
                  id="cli-dir-nombre"
                  value={nombreApellidosDirectorIiee}
                  onChange={(e) => setNombreApellidosDirectorIiee(e.target.value)}
                  placeholder="Como en la columna del Excel regional"
                  maxLength={200}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-mail">EMAIL DIRECTOR IIEE</Label>
                <Input id="cli-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cli-tel">TELEFONO 1 DIRECTOR IIEE</Label>
                <Input id="cli-tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
            </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
            <Checkbox id="cli-activo" checked={activo} onCheckedChange={(v) => setActivo(Boolean(v))} />
            <Label htmlFor="cli-activo" className="cursor-pointer font-normal leading-snug text-sm">
              ACTIVO
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => submit()} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {busy ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
