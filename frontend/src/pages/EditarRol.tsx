import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { defaultWebPermissionMap, permissionGroups, PermissionGroupCard } from "./NuevoRol";
import { useWebRoleDetailQuery } from "@/hooks/useOperationsQueries";
import { webRolesApi } from "@/services";

const EditarRol = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useWebRoleDetailQuery(id);

  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activePermissions, setActivePermissions] = useState<Record<string, boolean>>(() => defaultWebPermissionMap());

  useEffect(() => {
    if (!data) return;
    setClave(data.clave);
    setNombre(data.nombre);
    setDescripcion(data.descripcion ?? "");
    setActivePermissions({ ...defaultWebPermissionMap(), ...data.permissions });
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      webRolesApi.update(id!, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        permissions: { ...defaultWebPermissionMap(), ...activePermissions },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles-web"] });
      void queryClient.invalidateQueries({ queryKey: ["roles-web", "opciones"] });
      void queryClient.invalidateQueries({ queryKey: ["rol-web", id] });
      toast.success("Rol actualizado correctamente.");
      navigate("/usuarios/roles");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar el rol.");
    },
  });

  const togglePermission = (permId: string, val: boolean) => {
    setActivePermissions((prev) => ({ ...prev, [permId]: val }));
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
    if (!id) return;
    const n = nombre.trim();
    if (!n) {
      toast.error("Indica el nombre del rol.");
      return;
    }
    updateMutation.mutate();
  };

  if (!id) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Rol no especificado.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Cargando rol…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-sm font-medium text-destructive">No se pudo cargar el rol</p>
        <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : ""}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => navigate("/usuarios/roles")}>
          Volver a roles
        </Button>
      </div>
    );
  }

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
            <span className="font-medium text-foreground">Editar rol</span>
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
            <h1 className="text-xl font-bold tracking-tight text-foreground">Editar rol</h1>
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
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </header>

      {!data.activo && (
        <div className="border-b border-warning/40 bg-warning/10 px-4 py-2 text-center text-sm text-warning sm:px-6">
          Este rol está desactivado. Actívalo desde el listado para poder asignarlo; la edición de permisos sigue disponible.
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid max-w-xl gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Clave del rol</Label>
              <Input value={clave} disabled className="border-border/80 bg-muted/40 font-mono text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="er-nombre" className="text-xs text-muted-foreground">
                <span className="mr-1 text-primary">*</span>Nombre del rol
              </Label>
              <Input
                id="er-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border-border/80 bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="er-desc" className="text-xs text-muted-foreground">
                Descripción
              </Label>
              <Textarea
                id="er-desc"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="min-h-[80px] border-border/80 bg-background"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {permissionGroups.map((group) => (
              <PermissionGroupCard
                key={group.id}
                group={group}
                activePermissions={activePermissions}
                togglePermission={togglePermission}
                toggleGroup={toggleGroup}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarRol;
