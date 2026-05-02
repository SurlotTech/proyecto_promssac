import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { webRolesApi } from "@/services";

export type Permission = {
  id: string;
  label: string;
  isSub?: boolean;
};

export type PermissionGroup = {
  id: string;
  title: string;
  total: number;
  permissions: Permission[];
};

export const permissionGroups: PermissionGroup[] = [
  {
    id: "general",
    title: "General",
    total: 15,
    permissions: [
      { id: "g1", label: "Actividad" },
      { id: "g2", label: "Rutas" },
      { id: "g3", label: "Ordenes" },
      { id: "g3-1", label: "Crear órdenes", isSub: true },
      { id: "g3-2", label: "Editar órdenes", isSub: true },
      { id: "g3-3", label: "Editar gestión de una orden", isSub: true },
      { id: "g3-4", label: "Eliminar órdenes", isSub: true },
      { id: "g4", label: "Flota" },
      { id: "g5", label: "Clientes" },
      { id: "g6", label: "Importación" },
      { id: "g7", label: "Retiro en tienda" },
      { id: "g8", label: "Alertas" },
      { id: "g9", label: "Estadísticas" },
      { id: "g10", label: "Documentos" },
      { id: "g11", label: "Costos" },
    ],
  },
  {
    id: "ajustes",
    title: "Ajustes",
    total: 8,
    permissions: [
      { id: "a1", label: "Cuenta" },
      { id: "a2", label: "Usuarios" },
      { id: "a2-1", label: "Crear usuarios web", isSub: true },
      { id: "a2-2", label: "Crear usuarios móviles", isSub: true },
      { id: "a3", label: "Gestionar" },
      { id: "a4", label: "Vehículos" },
      { id: "a5", label: "Configuración avanzada" },
      { id: "a6", label: "Widget" },
    ],
  },
  {
    id: "quickcommerce",
    title: "Quickcommerce",
    total: 9,
    permissions: [
      { id: "q1", label: "Módulo Visualizador" },
      { id: "q2", label: "Módulo Auto-asignador" },
      { id: "q3", label: "Asignador" },
      { id: "q4", label: "Módulo Torre de control" },
      { id: "q5", label: "Permisos de revisión" },
      { id: "q6", label: "Módulo Mapa de conductores" },
      { id: "q7", label: "Módulo Bitácora de operación" },
      { id: "q8", label: "Ajustes" },
      { id: "q8-1", label: "Cambiar disponibilidad de conductores", isSub: true },
    ],
  },
];

export function allWebPermissionIds(): string[] {
  return permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));
}

export function defaultWebPermissionMap(): Record<string, boolean> {
  return Object.fromEntries(allWebPermissionIds().map((id) => [id, false]));
}

export const PermissionGroupCard = ({
  group,
  activePermissions,
  togglePermission,
  toggleGroup,
}: {
  group: PermissionGroup;
  activePermissions: Record<string, boolean>;
  togglePermission: (id: string, val: boolean) => void;
  toggleGroup: (groupId: string, active: boolean) => void;
}) => {
  const [expanded, setExpanded] = useState(true);

  const activeCount = group.permissions.filter((p) => activePermissions[p.id]).length;
  const isAllActive = activeCount === group.permissions.length;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div
        className="flex cursor-pointer select-none items-center justify-between border-b border-border bg-muted/30 p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-sm font-semibold text-foreground">
          {group.title} ({activeCount}/{group.total})
        </h3>
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          {isAllActive ? (
            <span
              className="cursor-pointer text-sm font-medium text-info hover:underline"
              onClick={() => toggleGroup(group.id, false)}
            >
              Desactivar todo
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Inactivo</span>
              <Switch checked={isAllActive} onCheckedChange={(checked) => toggleGroup(group.id, checked)} />
            </div>
          )}
          <button
            type="button"
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col">
          {group.permissions.map((p, index) => (
            <div
              key={p.id}
              className={cn(
                "flex items-center justify-between p-3.5 transition-colors hover:bg-muted/10",
                index !== group.permissions.length - 1 && "border-b border-border/50",
                p.isSub && "bg-muted/5 pl-8",
              )}
            >
              <div className="flex items-center gap-2">
                {p.isSub && <span className="text-muted-foreground/60">↳</span>}
                <span className={cn("text-sm", p.isSub ? "text-muted-foreground" : "font-medium text-foreground")}>
                  {p.label}
                </span>
              </div>
              <Switch checked={!!activePermissions[p.id]} onCheckedChange={(checked) => togglePermission(p.id, checked)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CLAVE_REGEX = /^[a-z0-9_-]+$/;

const NuevoRol = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activePermissions, setActivePermissions] = useState<Record<string, boolean>>(() => defaultWebPermissionMap());

  const createMutation = useMutation({
    mutationFn: () =>
      webRolesApi.create({
        clave: clave.trim().toLowerCase(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        permissions: { ...defaultWebPermissionMap(), ...activePermissions },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles-web"] });
      void queryClient.invalidateQueries({ queryKey: ["roles-web", "opciones"] });
      toast.success("Rol creado correctamente.");
      navigate("/usuarios/roles");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "No se pudo crear el rol.");
    },
  });

  const togglePermission = (id: string, val: boolean) => {
    setActivePermissions((prev) => ({ ...prev, [id]: val }));
  };

  const toggleGroup = (groupId: string, active: boolean) => {
    const group = permissionGroups.find((g) => g.id === groupId);
    if (!group) return;
    const next = { ...activePermissions };
    group.permissions.forEach((p) => {
      next[p.id] = active;
    });
    setActivePermissions(next);
  };

  const activateAllGlobal = () => {
    const next: Record<string, boolean> = {};
    permissionGroups.forEach((g) => {
      g.permissions.forEach((p) => {
        next[p.id] = true;
      });
    });
    setActivePermissions(next);
  };

  const handleSave = () => {
    const c = clave.trim().toLowerCase();
    const n = nombre.trim();
    if (!c || c.length < 2) {
      toast.error("Indica una clave de rol (mín. 2 caracteres, solo minúsculas, números, guión o _).");
      return;
    }
    if (!CLAVE_REGEX.test(c)) {
      toast.error("La clave solo puede usar minúsculas, números, guión y guión bajo.");
      return;
    }
    if (!n) {
      toast.error("Indica el nombre del rol.");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col">
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="cursor-pointer transition-colors hover:text-foreground" onClick={() => navigate("/usuarios/web")}>
              Usuarios web
            </span>
            <span>/</span>
            <span className="cursor-pointer transition-colors hover:text-foreground" onClick={() => navigate("/usuarios/roles")}>
              Roles de usuario
            </span>
            <span>/</span>
            <span className="font-medium text-foreground">Nuevo rol</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => navigate("/usuarios/roles")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Nuevo rol</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="mr-2 cursor-pointer text-sm font-semibold text-info hover:underline" onClick={activateAllGlobal}>
            Activar todo
          </span>
          <Button variant="outline" size="sm" className="h-9 font-medium" onClick={() => navigate("/usuarios/roles")}>
            Cancelar
          </Button>
          <Button
            size="sm"
            className="h-9 bg-primary px-6 font-medium text-primary-foreground shadow-glow hover:bg-primary-hover"
            onClick={handleSave}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid max-w-xl gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rol-clave" className="text-xs text-muted-foreground">
                <span className="mr-1 text-primary">*</span>Clave del rol
              </Label>
              <Input
                id="rol-clave"
                value={clave}
                onChange={(e) => setClave(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                className="border-border/80 bg-background font-mono text-sm"
                placeholder="ej. logistica_norte"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">Única, en minúsculas; se usa al asignar usuarios (no se puede cambiar después).</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rol-nombre" className="text-xs text-muted-foreground">
                <span className="mr-1 text-primary">*</span>Nombre del rol
              </Label>
              <Input
                id="rol-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border-border/80 bg-background"
                placeholder="Ej. Operador logístico"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rol-desc" className="text-xs text-muted-foreground">
                Descripción
              </Label>
              <Textarea
                id="rol-desc"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="min-h-[80px] border-border/80 bg-background"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <PermissionGroupCard
                group={permissionGroups[0]}
                activePermissions={activePermissions}
                togglePermission={togglePermission}
                toggleGroup={toggleGroup}
              />
            </div>
            <div className="space-y-6">
              <PermissionGroupCard
                group={permissionGroups[1]}
                activePermissions={activePermissions}
                togglePermission={togglePermission}
                toggleGroup={toggleGroup}
              />
              <PermissionGroupCard
                group={permissionGroups[2]}
                activePermissions={activePermissions}
                togglePermission={togglePermission}
                toggleGroup={toggleGroup}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoRol;
