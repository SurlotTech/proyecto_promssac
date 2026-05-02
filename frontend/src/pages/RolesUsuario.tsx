import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWebRolesQuery } from "@/hooks/useOperationsQueries";
import { webRolesApi } from "@/services";

type ActivoDialog = { id: string; nombre: string; activo: boolean } | null;

const RolesUsuario = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: roles = [], isLoading, isError, error, refetch } = useWebRolesQuery();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [activoDialog, setActivoDialog] = useState<ActivoDialog>(null);

  const setActivoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => webRolesApi.setActivo(id, activo),
    onSuccess: (_, { activo }) => {
      void queryClient.invalidateQueries({ queryKey: ["roles-web"] });
      void queryClient.invalidateQueries({ queryKey: ["roles-web", "opciones"] });
      setActivoDialog(null);
      toast.success(activo ? "Rol activado." : "Rol desactivado.");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar el rol.");
    },
  });

  const filtered = useMemo(
    () => (includeInactive ? roles : roles.filter((r) => r.activo)),
    [roles, includeInactive],
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Cargando roles…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-sm font-medium text-destructive">No se pudieron cargar los roles</p>
        <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : "Error"}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col">
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="cursor-pointer transition-colors hover:text-foreground"
              onClick={() => navigate("/usuarios/web")}
            >
              Usuarios web
            </span>
            <span>/</span>
            <span className="font-medium text-foreground">Roles de usuario</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Roles de usuario</h1>
        </div>
        <Button
          size="sm"
          className="h-9 bg-primary font-medium text-primary-foreground shadow-glow hover:bg-primary-hover"
          onClick={() => navigate("/usuarios/roles/nuevo")}
        >
          + Nuevo rol
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="roles-include-inactive"
              checked={includeInactive}
              onCheckedChange={(v) => setIncludeInactive(v === true)}
            />
            <label htmlFor="roles-include-inactive" className="cursor-pointer text-sm font-medium text-foreground">
              Incluir roles desactivados
            </label>
          </div>
        </div>

        <div className="flex max-h-[min(80vh,800px)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Nombre</TableHead>
                  <TableHead className="font-semibold text-foreground">Clave</TableHead>
                  <TableHead className="font-semibold text-foreground">Estado</TableHead>
                  <TableHead className="font-semibold text-foreground">Permisos activos</TableHead>
                  <TableHead className="font-semibold text-foreground">Usuarios asignados</TableHead>
                  <TableHead className="font-semibold text-foreground">Última edición</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No hay roles que mostrar.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((role) => (
                    <TableRow key={role.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                            <Shield className="size-4" />
                          </div>
                          <button
                            type="button"
                            className="text-left font-medium text-foreground hover:underline"
                            onClick={() => navigate(`/usuarios/roles/${role.id}/editar`)}
                          >
                            {role.nombre}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{role.clave}</TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{role.activo ? "Activo" : "Inactivo"}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{role.permisosActivos}</TableCell>
                      <TableCell className="text-muted-foreground">{role.usuariosAsignados}</TableCell>
                      <TableCell className="text-muted-foreground">{role.ultimaEdicion}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 border-border bg-card shadow-md">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => navigate(`/usuarios/roles/${role.id}/editar`)}
                            >
                              Editar
                            </DropdownMenuItem>
                            {role.activo ? (
                              <DropdownMenuItem
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => setActivoDialog({ id: role.id, nombre: role.nombre, activo: false })}
                              >
                                Desactivar rol
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setActivoDialog({ id: role.id, nombre: role.nombre, activo: true })}
                              >
                                Activar rol
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={activoDialog != null} onOpenChange={(open) => !open && setActivoDialog(null)}>
        <DialogContent className="border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activoDialog?.activo ? "Activar rol" : "Desactivar rol"}</DialogTitle>
            <DialogDescription>
              {activoDialog?.activo
                ? `¿Activar el rol «${activoDialog.nombre}»? Volverá a estar disponible al asignar usuarios web.`
                : `¿Desactivar el rol «${activoDialog?.nombre ?? ""}»? No podrá asignarse a usuarios nuevos; si hay usuarios con este rol, la operación fallará hasta que los reasignes.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setActivoDialog(null)} disabled={setActivoMutation.isPending}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant={activoDialog?.activo ? "default" : "destructive"}
              disabled={setActivoMutation.isPending || !activoDialog}
              onClick={() => {
                if (!activoDialog) return;
                setActivoMutation.mutate({ id: activoDialog.id, activo: activoDialog.activo });
              }}
            >
              {setActivoMutation.isPending ? "Guardando…" : activoDialog?.activo ? "Activar" : "Desactivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesUsuario;
