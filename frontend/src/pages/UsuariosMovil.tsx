import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MoreVertical, RotateCcw, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { data: users = [], isLoading, isError, refetch } = useMobileUsersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
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
    let list = includeInactive ? users : users.filter((u) => u.estado === "Activo");
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
  }, [users, includeInactive, searchTerm]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Usuarios móviles</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Usuarios activos: <span className="text-foreground">{isLoading ? "…" : activeCount}</span>
            <span className="mx-2 text-border">|</span>
            Bloqueados: <span className="text-foreground">{isLoading ? "…" : blockedCount}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="h-9 bg-primary font-medium text-primary-foreground shadow-glow hover:bg-primary-hover"
            onClick={() => navigate("/usuarios/movil/nuevo")}
          >
            Nuevo usuario
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/20 p-4">
            <Input
              placeholder="Buscar usuario móvil"
              className="h-9 w-full bg-background sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-inactive-movil"
                checked={includeInactive}
                onCheckedChange={(v) => setIncludeInactive(v === true)}
              />
              <label htmlFor="include-inactive-movil" className="cursor-pointer text-sm font-medium text-foreground">
                Incluir inactivos
              </label>
            </div>
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => void refetch()}
              aria-label="Actualizar listado"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

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
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 border-border bg-card shadow-md">
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
