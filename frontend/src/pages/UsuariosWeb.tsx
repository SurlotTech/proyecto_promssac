import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Plus, Search, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  rol: string;
};

const emptyFilters: FilterDraft = { nombre: "", rol: "" };

function filterUsers(
  users: WebUserListItem[],
  applied: FilterDraft,
  estadoFiltro: "todos" | "activos" | "inactivos",
): WebUserListItem[] {
  let list = estadoFiltro === "todos" ? users
    : estadoFiltro === "inactivos" ? users.filter((u) => u.estado !== "Activo")
    : users.filter((u) => u.estado === "Activo");
  const n = applied.nombre.toLowerCase().trim();
  const rq = applied.rol.trim().toLowerCase();
  if (n) list = list.filter((u) => u.nombreCompleto.toLowerCase().includes(n) || u.nombreUsuario.toLowerCase().includes(n));
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
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "activos" | "inactivos">("activos");
  const { data: users = [], isLoading, isError } = useWebUsersQuery(true);
  const { data: roleOptions = [] } = useWebRoleOptionsQuery();

  const [draftFilters, setDraftFilters] = useState<FilterDraft>(emptyFilters);
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
    () => filterUsers(users, draftFilters, estadoFiltro),
    [users, draftFilters, estadoFiltro],
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
              className="h-12 gap-1.5 text-base font-normal bg-primary hover:bg-primary text-white px-6 shadow-md transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate("/usuarios/web/nuevo")}
            >
              <Plus className="size-5" /> Nuevo
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4 pt-1 sm:p-6 sm:pt-2 lg:p-8 lg:pt-2">
        <div className="rounded-[14px] border border-border/40 bg-white/30 shadow-md overflow-hidden">
          {/* Filter bar */}
          <div className="bg-white/30">
            <div className="flex h-12 items-center gap-9 border-b border-[#eef0f3] px-5">
              {(["todos", "activos", "inactivos"] as const).map((tab) => {
                const count = tab === "todos" ? users.length : tab === "activos" ? activeCount : blockedCount;
                const variant = tab === "todos" ? "bg-[#1f2933] text-white" : tab === "activos" ? "bg-[#d8f7e5] text-[#009f5b]" : "bg-[#e9eef2] text-[#5f7282]";
                return (
                  <button
                    key={tab}
                    onClick={() => setEstadoFiltro(tab)}
                    className={cn(
                      "inline-flex h-12 items-center gap-2 border-b-2 text-sm font-medium transition-colors",
                      estadoFiltro === tab
                        ? "border-[#111827] text-[#1f2933] font-bold"
                        : "border-transparent text-[#52677a] hover:text-[#1f2933]",
                    )}
                  >
                    {tab === "todos" ? "Todos" : tab === "activos" ? "Activos" : "Inactivos"}
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", variant)}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 px-5 py-5">
              <div className="relative flex-1 max-w-[380px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8a9aab]" />
                <Input
                  placeholder="Buscar por nombre o usuario..."
                  value={draftFilters.nombre}
                  onChange={(e) => setDraftFilters((d) => ({ ...d, nombre: e.target.value }))}
                  className="h-14 rounded-lg border border-[#e1e7ee] bg-white/60 pl-10 text-[15px] text-[#1f2933] placeholder:text-[#8a9aab] transition-colors hover:border-primary focus-visible:ring-1"
                />
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={draftFilters.rol || "all"}
                  onValueChange={(v) => setDraftFilters((d) => ({ ...d, rol: v === "all" ? "" : v }))}
                >
                  <SelectTrigger className="h-14 w-[150px] rounded-lg border border-[#e1e7ee] bg-white/60 px-3.5 text-[15px] text-[#8a9aab]">
                    <SelectValue placeholder="Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {roleOptions.map((r) => (
                      <SelectItem key={r.clave} value={r.nombre}>
                        {r.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(draftFilters.nombre || draftFilters.rol) && (
              <div className="px-5 pb-3 flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#1f2933]">{filteredUsers.length} resultado{filteredUsers.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {draftFilters.nombre && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Búsqueda: {draftFilters.nombre}
                      <button onClick={() => setDraftFilters((p) => ({ ...p, nombre: "" }))} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                  {draftFilters.rol && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eef1f5] px-2.5 py-1 text-xs font-medium text-[#52677a]">
                      Rol: {draftFilters.rol}
                      <button onClick={() => setDraftFilters((p) => ({ ...p, rol: "" }))} className="ml-0.5 text-[#8a9aab] hover:text-[#1f2933]">✕</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Table */}
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
              <table className="w-full">
                <thead>
                  <tr className="h-11 bg-[#eef1f5] text-left text-xs font-bold text-[#647789]">
                    <th className="px-4">Nombre</th>
                    <th className="px-4">Estado</th>
                    <th className="px-4">Usuario</th>
                    <th className="px-4">Rol/Permisos</th>
                    <th className="px-4">Última conexión</th>
                    <th className="w-14 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="h-[60px] border-b border-dashed border-[#e3e8ee] bg-white/30 transition-colors hover:bg-[#fafbfc]"
                    >
                      <td className="px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dfe4ea] text-[#5f7282]">
                            <User className="size-4" />
                          </div>
                          <button
                            type="button"
                            className="text-sm font-medium text-[#1f2933] hover:text-primary hover:underline underline-offset-4 transition-colors"
                            onClick={() => navigate(`/usuarios/web/${user.id}/editar`)}
                          >
                            {user.nombreCompleto}
                          </button>
                        </div>
                      </td>
                      <td className="px-4">
                        <span className={cn(
                          "text-sm font-medium",
                          user.estado === "Activo" ? "text-[#009f5b]" : "text-[#d92316]",
                        )}>
                          {user.estado}
                        </span>
                      </td>
                      <td className="px-4 text-sm text-[#52677a]">{user.nombreUsuario}</td>
                      <td className="px-4 text-sm text-[#52677a]">{user.rolPermisos}</td>
                      <td className="px-4 text-sm text-[#52677a]">{user.ultimaConexion}</td>
                      <td className="px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8a9aab] hover:bg-[#e9eef2] hover:text-[#1f2933]">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/usuarios/web/${user.id}/editar`)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/usuarios/web/${user.id}/editar?tab=permisos`)}>
                              Ver permisos
                            </DropdownMenuItem>
                            {user.estado === "Activo" ? (
                              <DropdownMenuItem
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => setActivoDialog({ id: user.id, nombreCompleto: user.nombreCompleto, activo: false })}
                              >
                                Bloquear usuario
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setActivoDialog({ id: user.id, nombreCompleto: user.nombreCompleto, activo: true })}>
                                Activar usuario
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setRolModalUserId(user.id)}>
                              Cambiar rol
                            </DropdownMenuItem>
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

      <Dialog open={rolModalUserId != null} onOpenChange={(open) => !open && closeRolModal()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Cambiar rol de usuario</DialogTitle>
            <DialogDescription>Selecciona el nuevo rol que deseas asignar a este usuario.</DialogDescription>
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar nuevo rol" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(50vh,280px)]">
                    {newRoleKey && !roleOptions.some((r) => r.clave === newRoleKey) && (
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
            <Button type="button" variant="outline" onClick={closeRolModal} disabled={updateRolMutation.isPending}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
              disabled={updateRolMutation.isPending || rolDetailLoading || !rolDetail || !newRoleKey.trim() || roleOptions.length === 0}
              onClick={() => updateRolMutation.mutate()}
            >
              {updateRolMutation.isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activoDialog != null} onOpenChange={(open) => !open && setActivoDialog(null)}>
        <DialogContent className="sm:max-w-md">
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
