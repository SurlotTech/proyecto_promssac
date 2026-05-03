import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FullscreenLoadOrError } from "@/components/common/FullscreenLoadOrError";
import { defaultWebPermissionMap, permissionGroups, PermissionGroupCard } from "./NuevoRol";
import { webUsersApi } from "@/services/webUsers.api";
import { useWebRoleOptionsQuery, useWebUserDetailQuery } from "@/hooks/useOperationsQueries";
import { toast } from "sonner";

const FormSectionTitle = ({ children }: { children: ReactNode }) => (
  <div className="border-b border-border bg-muted/35 px-5 py-3">
    <h2 className="text-sm font-semibold tracking-tight text-foreground">{children}</h2>
  </div>
);

const EditarUsuario = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const goToList = () => navigate("/usuarios/web");
  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
  } = useWebUserDetailQuery(editId);
  const { data: roleOptions = [] } = useWebRoleOptionsQuery();
  const hydratedRef = useRef(false);

  const [permissionsExpanded, setPermissionsExpanded] = useState(true);
  const [permissionType, setPermissionType] = useState<"rol" | "personalizado">("rol");
  const [selectedRole, setSelectedRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [activePermissions, setActivePermissions] = useState<Record<string, boolean>>(() => defaultWebPermissionMap());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    hydratedRef.current = false;
  }, [editId]);

  useEffect(() => {
    if (!detail) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    setFullName(detail.nombreCompleto);
    setUsername(detail.nombreUsuario);
    setEmail(detail.email);
    setPassword("");
    setPassword2("");
    const mode = detail.permissionMode === "personalizado" ? "personalizado" : "rol";
    setPermissionType(mode);
    setSelectedRole(mode === "rol" && detail.roleKey ? detail.roleKey : "");
    setActivePermissions({ ...defaultWebPermissionMap(), ...detail.permissions });
  }, [detail]);

  /** Desde listado: ?tab=permisos | ?tab=rol (misma pantalla que “Copia 1”). */
  useEffect(() => {
    if (!detail) return;
    const tab = searchParams.get("tab");
    if (tab !== "permisos" && tab !== "rol") return;

    if (tab === "permisos") {
      setPermissionType("personalizado");
      setPermissionsExpanded(true);
    } else {
      setPermissionType("rol");
      setPermissionsExpanded(true);
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("tab");
        return next;
      },
      { replace: true },
    );

    const scrollId = tab === "rol" ? "eu-role-select" : "eu-permisos-section";
    requestAnimationFrame(() => {
      document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [detail, searchParams, setSearchParams]);

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

  const handleSave = async () => {
    if (!editId) return;
    const nombre = fullName.trim();
    const usuario = username.trim();
    const mail = email.trim();
    if (!nombre) {
      toast.error("Indica el nombre y apellido.");
      return;
    }
    if (!usuario) {
      toast.error("Indica el nombre de usuario.");
      return;
    }
    if (!mail) {
      toast.error("Indica el correo electrónico.");
      return;
    }
    const pin = password.trim();
    if (pin.length > 0 && pin.length < 8) {
      toast.error("Si cambias la contraseña, debe tener al menos 8 caracteres.");
      return;
    }
    if (pin !== password2.trim()) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    if (permissionType === "rol" && !selectedRole) {
      toast.error("Selecciona un rol.");
      return;
    }

    const permissions =
      permissionType === "personalizado" ? { ...defaultWebPermissionMap(), ...activePermissions } : {};

    setSubmitting(true);
    try {
      await webUsersApi.update(editId, {
        nombreCompleto: nombre,
        nombreUsuario: usuario,
        email: mail,
        permissionMode: permissionType,
        ...(permissionType === "rol" ? { roleKey: selectedRole } : {}),
        permissions,
        ...(pin.length >= 8 ? { contrasena: pin } : {}),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["usuarios-web"] }),
        queryClient.invalidateQueries({ queryKey: ["usuario-web", editId] }),
      ]);
      toast.success("Usuario actualizado correctamente.");
      goToList();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar el usuario.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!editId) {
    return <FullscreenLoadOrError variant="error" onBack={goToList} errorText="Identificador de usuario no válido." />;
  }

  if (detailLoading) {
    return <FullscreenLoadOrError variant="loading" onBack={goToList} loadingText="Cargando usuario…" />;
  }

  if (detailError || !detail) {
    return (
      <FullscreenLoadOrError
        variant="error"
        onBack={goToList}
        errorText="No se pudo cargar el usuario. Revisa el enlace o el backend."
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col">
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <button type="button" className="transition-colors hover:text-foreground" onClick={goToList}>
              Usuarios web
            </button>
            <span>/</span>
            <span className="font-medium text-foreground">Editar usuario web</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={goToList}
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Editar usuario</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="mr-1 text-primary">*</span>Indica que el campo es obligatorio (la contraseña no es obligatoria)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 font-medium" onClick={goToList}>
            Cancelar
          </Button>
          <Button
            size="sm"
            className="h-9 bg-primary px-6 font-medium text-primary-foreground shadow-glow hover:bg-primary-hover"
            disabled={submitting}
            onClick={() => void handleSave()}
          >
            {submitting ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <FormSectionTitle>Información del usuario</FormSectionTitle>
            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <Label htmlFor="eu-name" className="text-sm font-medium text-foreground">
                  <span className="text-primary">*</span> Nombre y apellido
                </Label>
                <Input
                  id="eu-name"
                  className="h-10 bg-background"
                  value={fullName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eu-username" className="text-sm font-medium text-foreground">
                  <span className="text-primary">*</span> Nombre de usuario
                </Label>
                <Input
                  id="eu-username"
                  className="h-10 bg-background"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                  autoComplete="username"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Nombre único para entrar a la plataforma. No debe contener espacios.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eu-email" className="text-sm font-medium text-foreground">
                  <span className="text-primary">*</span> Email
                </Label>
                <Input
                  id="eu-email"
                  type="email"
                  className="h-10 bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eu-password" className="text-sm font-medium text-foreground">
                  Nueva contraseña (opcional)
                </Label>
                <Input
                  id="eu-password"
                  type="password"
                  className="h-10 bg-background"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">Mínimo 8 caracteres. Déjala vacía para no cambiarla.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eu-password2" className="text-sm font-medium text-foreground">
                  Repite contraseña
                </Label>
                <Input
                  id="eu-password2"
                  type="password"
                  className="h-10 bg-background"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </section>

          <section
            id="eu-permisos-section"
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 border-b border-border bg-muted/35 px-5 py-3 text-left transition-colors hover:bg-muted/50"
              onClick={() => setPermissionsExpanded(!permissionsExpanded)}
              aria-expanded={permissionsExpanded}
            >
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Permisos</h2>
              <span className="text-muted-foreground">
                {permissionsExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </span>
            </button>

            {permissionsExpanded && (
              <div className="space-y-6 p-5">
                <div className="space-y-4 border-b border-border/60 pb-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Defina los permisos eligiendo un rol o de forma personalizada. Puedes configurar roles en{" "}
                    <Link to="/usuarios/roles" className="font-medium text-primary underline-offset-4 hover:underline">
                      Roles de usuario
                    </Link>
                    .
                  </p>

                  <RadioGroup
                    value={permissionType}
                    onValueChange={(v) => setPermissionType(v as "rol" | "personalizado")}
                    className="flex flex-wrap gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="rol" id="eu-rol" />
                      <Label htmlFor="eu-rol" className="cursor-pointer text-sm font-medium text-foreground">
                        Rol de usuario
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="personalizado" id="eu-custom" />
                      <Label htmlFor="eu-custom" className="cursor-pointer text-sm font-medium text-foreground">
                        Personalizado
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {permissionType === "rol" && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Label htmlFor="eu-role-select" className="text-sm font-medium text-foreground">
                        Seleccionar rol
                      </Label>
                      <Select value={selectedRole || undefined} onValueChange={setSelectedRole}>
                        <SelectTrigger id="eu-role-select" className="h-10 bg-background">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[min(50vh,280px)]">
                          {selectedRole &&
                            !roleOptions.some((r) => r.clave === selectedRole) && (
                              <SelectItem value={selectedRole} disabled className="text-sm">
                                {selectedRole} (rol no disponible o inactivo)
                              </SelectItem>
                            )}
                          {roleOptions.map((r) => (
                            <SelectItem key={r.clave} value={r.clave} className="text-sm">
                              {r.nombre}
                            </SelectItem>
                          ))}
                          {roleOptions.length === 0 && !selectedRole && (
                            <div className="px-2 py-3 text-xs text-muted-foreground">No hay roles activos.</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0 border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => navigate("/usuarios/roles")}
                          aria-label="Ir a roles de usuario"
                        >
                          <Settings className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Gestionar roles</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {permissionType === "personalizado" && (
                  <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
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
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default EditarUsuario;
