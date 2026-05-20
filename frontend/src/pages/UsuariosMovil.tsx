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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="flex min-h-0 flex-1 flex-col bg-transparent animate-fade-in">
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
              className="h-9 bg-primary font-medium text-primary-foreground shadow-glow hover:bg-primary-hover"
              onClick={() => navigate("/usuarios/movil/nuevo")}
            >
              Nuevo usuario
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap lg:gap-2">
            <div className="relative min-w-0 flex-1 lg:max-w-lg">
              <Input
                placeholder="Buscar por nombre o usuario"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 rounded-full border-border/100 bg-transparent pl-10 shadow-none transition-colors hover:bg-zinc-50 focus-visible:ring-offset-0"
              />
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="flex items-center bg-transparent p-1 rounded-full border border-border h-12 px-1 shrink-0 transition-colors hover:bg-zinc-50/50">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setEstadoFiltro("activos")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-xs font-semibold transition-all h-8 flex items-center justify-center",
                    estadoFiltro === "activos"
                      ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-sm border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Activos
                </button>
                <button
                  type="button"
                  onClick={() => setEstadoFiltro("inactivos")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-xs font-semibold transition-all h-8 flex items-center justify-center",
                    estadoFiltro === "inactivos"
                      ? "bg-background text-destructive shadow-sm border border-border/40"
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
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm">
          {isError ? (
            <p className="p-6 text-sm text-destructive">No se pudo cargar el listado. Revisa el backend e intenta de nuevo.</p>
          ) : isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Cargando usuarios…</p>
          ) : filteredUsers.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              {users.length === 0 ? "No hay usuarios móviles registrados." : "Ningún resultado coincide con la búsqueda o filtros."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground">Nombre completo</TableHead>
                    <TableHead className="font-semibold text-foreground">Estado</TableHead>
                    <TableHead className="font-semibold text-foreground">Nombre de usuario</TableHead>
                    <TableHead className="font-semibold text-foreground">Tipo de usuario</TableHead>
                    <TableHead className="font-semibold text-foreground">Tipo de vehículo</TableHead>
                    <TableHead className="font-semibold text-foreground">Vehículo asignado</TableHead>
                    <TableHead className="font-semibold text-foreground">Fecha de creación</TableHead>
                    <TableHead className="font-semibold text-foreground">Días activo</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                            <User className="size-4" />
                          </div>
                          <button
                            type="button"
                            className="cursor-pointer text-left font-medium text-foreground hover:underline"
                            onClick={() => navigate(`/usuarios/movil/${user.id}/editar`)}
                          >
                            {user.nombreCompleto}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{user.estado}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.nombreUsuario}</TableCell>
                      <TableCell className="text-foreground">{user.tipoUsuario}</TableCell>
                      <TableCell className="text-foreground">{user.vehiculoTipo}</TableCell>
                      <TableCell className="text-foreground">{user.vehiculoAsignado}</TableCell>
                      <TableCell className="text-muted-foreground">{user.fechaCreacion}</TableCell>
                      <TableCell className="text-foreground">
                        <span className="inline-flex h-6 min-w-[40px] items-center justify-center rounded-full bg-primary-soft text-sm font-medium text-primary">
                          {user.diasActivo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 border-border bg-card/40 backdrop-blur-lg shadow-md">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
