import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, User, X, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useMobileUsersQuery } from "@/hooks/useOperationsQueries";
import { mobileUsersApi } from "@/services/mobileUsers.api";

type ActivoDialogState = {
  id: string;
  nombreCompleto: string;
  activo: boolean;
} | null;

const UsuariosMovil = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [estadoFiltro, setEstadoFiltro] = useState<"activos" | "inactivos">("activos");
  const { data: users = [], isLoading, isError } = useMobileUsersQuery(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activoDialog, setActivoDialog] = useState<ActivoDialogState>(null);

  const setActivoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => mobileUsersApi.setActivo(id, activo),
    onSuccess: (_, { activo }) => {
      void queryClient.invalidateQueries({ queryKey: ["usuarios-movil"] });
      setActivoDialog(null);
      toast.success(activo ? "Usuario activado." : "Usuario bloqueado.");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar el estado.");
    },
  });

  const activeCount = useMemo(() => users.filter((u) => u.estado === "Activo").length, [users]);
  const blockedCount = useMemo(() => users.filter((u) => u.estado !== "Activo").length, [users]);

  const filteredUsers = useMemo(() => {
    let list = estadoFiltro === "inactivos" ? users.filter((u) => u.estado !== "Activo") : users;
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (user) =>
          user.nombreCompleto.toLowerCase().includes(q) ||
          user.nombreUsuario.toLowerCase().includes(q) ||
          user.vehiculoAsignado.toLowerCase().includes(q) ||
          user.vehiculoTipo.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, searchTerm, estadoFiltro]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Usuarios móviles"
        subtitle={
          <>
            Usuarios activos: <span className="text-foreground">{isLoading ? "…" : activeCount}</span>
            <span className="mx-2 text-border">|</span>
            Bloqueados: <span className="text-foreground">{isLoading ? "…" : blockedCount}</span>
          </>
        }
        actions={
          <>
            <Button
              size="sm"
              className="h-9 bg-primary shadow-glow hover:bg-primary-hover"
              onClick={() => navigate("/usuarios/movil/nuevo")}
            >
              Nuevo usuario
            </Button>
          </>
        }
      />

      <div className="space-y-2 p-4 pt-1 sm:p-6 sm:pt-2 lg:p-8 lg:pt-2">
        <div className="flex flex-col gap-3 rounded-xl bg-muted/20 py-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
            <Input
              placeholder="Buscar por nombre o usuario"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full bg-zinc-50 pl-9 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:shadow-sm focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border bg-zinc-50 p-0.5">
              <button
                type="button"
                onClick={() => setEstadoFiltro("activos")}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all",
                  estadoFiltro === "activos"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Activos
              </button>
              <button
                type="button"
                onClick={() => setEstadoFiltro("inactivos")}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all",
                  estadoFiltro === "inactivos"
                    ? "bg-white text-destructive shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Inactivos
              </button>
            </div>
          </div>
        </div>

        {searchTerm && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-3.5 w-3.5" /> Limpiar filtros
            </Button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm">
          {isError ? (
            <p className="p-12 text-center text-sm text-destructive">No se pudo cargar el listado.</p>
          ) : isLoading ? (
            <p className="p-12 text-center text-sm text-muted-foreground">Cargando usuarios…</p>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-base font-semibold text-foreground">
                {users.length === 0 ? "No hay usuarios móviles registrados." : "Ningún resultado coincide con los filtros."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted text-left text-xs font-medium tracking-wider text-muted-foreground/80">
                    <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Nombre completo</th>
                    <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Estado</th>
                    <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Nombre de usuario</th>
                    <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Tipo de usuario</th>
                    <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Tipo de vehículo</th>
                    <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Vehículo asignado</th>
                    <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Fecha de creación</th>
                    <th className="whitespace-nowrap px-3.5 py-2.5 font-medium">Días activo</th>
                    <th className="whitespace-nowrap px-3.5 py-2.5 pr-5 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group transition-colors hover:bg-surface-muted">
                      <td className="px-3.5 py-2.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/usuarios/movil/${user.id}/editar`)}
                          className="flex items-center gap-2 text-left transition-all hover:translate-x-0.5 group/name"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover/name:bg-primary group-hover/name:text-white">
                            <User className="size-4" />
                          </div>
                          <span className="font-medium text-foreground transition-colors group-hover/name:text-primary group-hover/name:underline underline-offset-4">
                            {user.nombreCompleto}
                          </span>
                        </button>
                      </td>
                      <td className="px-3.5 py-2.5 text-foreground">{user.estado}</td>
                      <td className="px-3.5 py-2.5 text-muted-foreground">{user.nombreUsuario}</td>
                      <td className="px-3.5 py-2.5 text-foreground">{user.tipoUsuario}</td>
                      <td className="px-3.5 py-2.5 text-foreground">{user.vehiculoTipo}</td>
                      <td className="px-3.5 py-2.5 text-foreground">{user.vehiculoAsignado}</td>
                      <td className="px-3.5 py-2.5 text-muted-foreground">{user.fechaCreacion}</td>
                      <td className="px-3.5 py-2.5">
                        <span className="inline-flex h-6 min-w-[40px] items-center justify-center rounded-full bg-primary-soft text-sm font-medium text-primary">
                          {user.diasActivo}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => navigate(`/usuarios/movil/${user.id}/editar`)}
                            >
                              Editar
                            </DropdownMenuItem>
                            {user.estado === "Activo" ? (
                              <DropdownMenuItem
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() =>
                                  setActivoDialog({
                                    id: user.id,
                                    nombreCompleto: user.nombreCompleto,
                                    activo: false,
                                  })
                                }
                              >
                                Bloquear usuario
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  setActivoDialog({
                                    id: user.id,
                                    nombreCompleto: user.nombreCompleto,
                                    activo: true,
                                  })
                                }
                              >
                                Activar usuario
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={activoDialog != null} onOpenChange={(open) => !open && setActivoDialog(null)}>
        <DialogContent className="border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activoDialog?.activo ? "Activar usuario" : "Bloquear usuario"}</DialogTitle>
            <DialogDescription>
              {activoDialog?.activo
                ? `¿Confirmas que deseas activar a «${activoDialog.nombreCompleto}»? Podrá volver a usar la app móvil según sus permisos.`
                : `¿Confirmas que deseas bloquear a «${activoDialog?.nombreCompleto ?? ""}»? No podrá acceder hasta que lo actives de nuevo.`}
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
              {setActivoMutation.isPending ? "Guardando…" : activoDialog?.activo ? "Activar" : "Bloquear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsuariosMovil;
