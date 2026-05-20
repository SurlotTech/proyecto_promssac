import { useEffect, useMemo, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RolWebOpcion } from "@/domain/webRoles";
import type { WebUserDetail, WebUserListItem } from "@/domain/webUsers";
import { useWebRoleOptionsQuery, useWebUserDetailQuery, useWebUsersQuery } from "@/hooks/useOperationsQueries";
import { webUsersApi } from "@/services/webUsers.api";

type ActivoDialogState = {
  id: string;
  nombreCompleto: string;
  activo: boolean;
} | null;

type FilterDraft = {
  nombre: string;
  usuario: string;
  estado: "" | "Activo" | "Inactivo";
  rol: string;
};

const emptyFilters: FilterDraft = { nombre: "", usuario: "", estado: "", rol: "" };

function filterUsers(
  users: WebUserListItem[],
  applied: FilterDraft,
  estadoFiltro: "activos" | "inactivos",
): WebUserListItem[] {
  let list = estadoFiltro === "inactivos" ? users.filter((u) => u.estado !== "Activo") : users.filter((u) => u.estado === "Activo");
  const n = applied.nombre.toLowerCase().trim();
  const uq = applied.usuario.toLowerCase().trim();
  const rq = applied.rol.trim().toLowerCase();
  if (n) list = list.filter((u) => u.nombreCompleto.toLowerCase().includes(n));
  if (uq) list = list.filter((u) => u.nombreUsuario.toLowerCase().includes(uq));
  if (applied.estado) list = list.filter((u) => u.estado === applied.estado);
  if (rq) list = list.filter((u) => u.rolPermisos.toLowerCase().includes(rq));
  return list;
}

function rolActualLabel(detail: WebUserDetail | undefined, options: RolWebOpcion[]): string {
  if (!detail) return "—";
  if (detail.permissionMode === "personalizado") return "Personalizado";
  const k = detail.roleKey?.trim();
  if (!k) return "—";
  return options.find((r) => r.clave === k)?.nombre ?? k;
}

const UsuariosWeb = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [estadoFiltro, setEstadoFiltro] = useState<"activos" | "inactivos">("activos");
  const { data: users = [], isLoading, isError } = useWebUsersQuery(true);
  const { data: roleOptions = [] } = useWebRoleOptionsQuery();

const [draftFilters, setDraftFilters] = useState<FilterDraft>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterDraft>(emptyFilters);
  const [activoDialog, setActivoDialog] = useState<ActivoDialogState>(null);
  const [rolModalUserId, setRolModalUserId] = useState<string | null>(null);
  const [newRoleKey, setNewRoleKey] = useState("");

  const {
    data: rolDetail,
    isLoading: rolDetailLoading,
    isError: rolDetailError,
  } = useWebUserDetailQuery(rolModalUserId ?? undefined);

  const closeRolModal = () => {
    setRolModalUserId(null);
    setNewRoleKey("");
  };

  const setActivoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => webUsersApi.setActivo(id, activo),
    onSuccess: (_, { activo }) => {
      void queryClient.invalidateQueries({ queryKey: ["usuarios-web"] });
      setActivoDialog(null);
      toast.success(activo ? "Usuario activado." : "Usuario bloqueado.");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar el estado.");
    },
  });

  useEffect(() => {
    if (!rolDetail || !rolModalUserId) return;
    setNewRoleKey(
      rolDetail.permissionMode === "rol" && rolDetail.roleKey
        ? rolDetail.roleKey
        : (roleOptions[0]?.clave ?? ""),
    );
  }, [rolDetail, rolModalUserId, roleOptions]);

  const updateRolMutation = useMutation({
    mutationFn: async () => {
      if (!rolDetail || !rolModalUserId) throw new Error("Sin datos de usuario.");
      const rk = newRoleKey.trim();
      if (!rk) throw new Error("Selecciona un rol.");
      await webUsersApi.update(rolModalUserId, {
        nombreCompleto: rolDetail.nombreCompleto,
        nombreUsuario: rolDetail.nombreUsuario,
        email: rolDetail.email,
        permissionMode: "rol",
        roleKey: rk,
        permissions: {},
      });
    },
    onSuccess: () => {
      const uid = rolModalUserId;
      void queryClient.invalidateQueries({ queryKey: ["usuarios-web"] });
      if (uid) void queryClient.invalidateQueries({ queryKey: ["usuario-web", uid] });
      closeRolModal();
      toast.success("Rol actualizado correctamente.");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "No se pudo cambiar el rol.");
    },
  });

  const activeCount = useMemo(() => users.filter((u) => u.estado === "Activo").length, [users]);
  const blockedCount = useMemo(() => users.filter((u) => u.estado !== "Activo").length, [users]);

  const filteredUsers = useMemo(
    () => filterUsers(users, appliedFilters, estadoFiltro),
    [users, appliedFilters, estadoFiltro],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent animate-fade-in">
      <PageHeader
        title="Usuarios web"
        subtitle={
          <>
            Usuarios activos:{" "}
            <span className="text-foreground">{isLoading ? "…" : activeCount}</span>
            <span className="mx-2 text-border">|</span>
            Usuarios bloqueados: <span className="text-foreground">{isLoading ? "…" : blockedCount}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 font-medium" onClick={() => navigate("/usuarios/roles")}>
              Roles de usuario
            </Button>
            <Button
              size="sm"
              className="h-9 bg-primary font-medium text-primary-foreground shadow-glow hover:bg-primary-hover"
              onClick={() => navigate("/usuarios/web/nuevo")}
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
                value={draftFilters.nombre || draftFilters.usuario}
                onChange={(e) => setDraftFilters((d) => ({ ...d, nombre: e.target.value, usuario: e.target.value }))}
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

            <div className="flex flex-wrap items-center gap-2 sm:justify-end lg:contents">
              <Select
                value={draftFilters.estado || "all"}
                onValueChange={(v) => setDraftFilters((d) => ({ ...d, estado: v === "all" ? "" : v as FilterDraft["estado"] }))}
              >
                <SelectTrigger className="h-12 w-full min-w-0 shrink rounded-full border-border/100 bg-transparent px-4 py-0 shadow-none transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-fit sm:max-w-[min(100%,14rem)]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Estados</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={draftFilters.rol || "all"}
                onValueChange={(v) => setDraftFilters((d) => ({ ...d, rol: v === "all" ? "" : v }))}
              >
                <SelectTrigger className="h-12 w-full min-w-0 shrink rounded-full border-border/100 bg-transparent px-4 py-0 shadow-none transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:w-fit sm:max-w-[min(100%,14rem)]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Roles</SelectItem>
                  {roleOptions.map((r) => (
                    <SelectItem key={r.clave} value={r.nombre}>
                      {r.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(draftFilters.nombre || draftFilters.usuario || draftFilters.estado || draftFilters.rol) && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDraftFilters(emptyFilters)}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-3.5 w-3.5" /> Limpiar filtros
              </Button>
            </div>
          )}

        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
          {isError ? (
            <p className="p-6 text-sm text-destructive">No se pudo cargar el listado. Revisa el backend e intenta de nuevo.</p>
          ) : isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Cargando usuarios…</p>
          ) : filteredUsers.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              {users.length === 0 ? "No hay usuarios web registrados." : "Ningún resultado coincide con la búsqueda o filtros."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground">Nombre</TableHead>
                    <TableHead className="font-semibold text-foreground">Estado</TableHead>
                    <TableHead className="font-semibold text-foreground">Usuario</TableHead>
                    <TableHead className="font-semibold text-foreground">Rol/Permisos</TableHead>
                    <TableHead className="font-semibold text-foreground">Última conexión</TableHead>
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
                            className="text-left font-medium text-foreground hover:underline"
                            onClick={() => navigate(`/usuarios/web/${user.id}/editar`)}
                          >
                            {user.nombreCompleto}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{user.estado}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.nombreUsuario}</TableCell>
                      <TableCell className="text-muted-foreground">{user.rolPermisos}</TableCell>
                      <TableCell className="text-muted-foreground">{user.ultimaConexion}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 border-border bg-card/80 backdrop-blur-md shadow-md">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => navigate(`/usuarios/web/${user.id}/editar`)}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => navigate(`/usuarios/web/${user.id}/editar?tab=permisos`)}
                            >
                              Ver permisos
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
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setRolModalUserId(user.id)}>
                              Cambiar rol
                            </DropdownMenuItem>
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

      <Dialog open={rolModalUserId != null} onOpenChange={(open) => !open && closeRolModal()}>
        <DialogContent className="sm:max-w-[550px] border-border bg-card/80 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Cambiar rol de usuario</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Selecciona el nuevo rol que deseas asignar a este usuario.
            </DialogDescription>
          </DialogHeader>

          {rolDetailLoading ? (
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">Cargando…</p>
            </div>
          ) : rolDetailError || !rolDetail ? (
            <div className="py-4 space-y-4">
              <p className="text-sm text-destructive">No se pudo cargar el usuario.</p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Rol actual:{" "}
                  <span className="font-normal text-muted-foreground">{rolActualLabel(rolDetail, roleOptions)}</span>
                </p>
                <Select value={newRoleKey || undefined} onValueChange={setNewRoleKey}>
                  <SelectTrigger className="w-full border-border bg-transparent text-foreground">
                    <SelectValue placeholder="Seleccionar nuevo rol" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(50vh,280px)]">
                    {newRoleKey &&
                      !roleOptions.some((r) => r.clave === newRoleKey) && (
                        <SelectItem value={newRoleKey} disabled className="text-sm">
                          {newRoleKey} (no disponible)
                        </SelectItem>
                      )}
                    {roleOptions.map((r) => (
                      <SelectItem key={r.clave} value={r.clave} className="text-sm">
                        {r.nombre}
                      </SelectItem>
                    ))}
                    {roleOptions.length === 0 && (
                      <div className="px-2 py-3 text-xs text-muted-foreground">No hay roles activos.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground"
              onClick={closeRolModal}
              disabled={updateRolMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-primary text-primary-foreground shadow-glow hover:bg-primary-hover"
              disabled={
                updateRolMutation.isPending ||
                rolDetailLoading ||
                !rolDetail ||
                !newRoleKey.trim() ||
                roleOptions.length === 0
              }
              onClick={() => updateRolMutation.mutate()}
            >
              {updateRolMutation.isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activoDialog != null} onOpenChange={(open) => !open && setActivoDialog(null)}>
        <DialogContent className="border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activoDialog?.activo ? "Activar usuario" : "Bloquear usuario"}</DialogTitle>
            <DialogDescription>
              {activoDialog?.activo
                ? `¿Confirmas que deseas activar a «${activoDialog.nombreCompleto}»? Podrá volver a usar el sistema según sus permisos.`
                : `¿Confirmas que deseas bloquear a «${activoDialog?.nombreCompleto ?? ""}»? No podrá iniciar sesión hasta que lo actives de nuevo.`}
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

export default UsuariosWeb;
