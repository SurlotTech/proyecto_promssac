import { useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { defaultWebPermissionMap, permissionGroups, PermissionGroupCard } from "./NuevoRol";
import { useWebRoleOptionsQuery } from "@/hooks/useOperationsQueries";
import { webUsersApi } from "@/services/webUsers.api";
import { toast } from "sonner";

const FormSectionTitle = ({ children }: { children: ReactNode }) => (
  <div className="border-b border-border bg-muted/35 px-5 py-3">
    <h2 className="text-sm font-semibold tracking-tight text-foreground">{children}</h2>
  </div>
);

const NuevoUsuarioWeb = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: roleOptions = [] } = useWebRoleOptionsQuery();
  const [permissionsExpanded, setPermissionsExpanded] = useState(false);
  const [permissionType, setPermissionType] = useState<"rol" | "personalizado">("rol");
  const [selectedRole, setSelectedRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [activePermissions, setActivePermissions] = useState<Record<string, boolean>>(() => defaultWebPermissionMap());
  const [submitting, setSubmitting] = useState(false);

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

  const handleSave = async () => {
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
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
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
      await webUsersApi.create({
        nombreCompleto: nombre,
        nombreUsuario: usuario,
        email: mail,
        contrasena: password,
        permissionMode: permissionType,
        ...(permissionType === "rol" ? { roleKey: selectedRole } : {}),
        permissions,
      });
      await queryClient.invalidateQueries({ queryKey: ["usuarios-web"] });
      toast.success("Usuario web creado correctamente.");
      navigate("/usuarios/web");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo crear el usuario.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <nav className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
            <button type="button" className="hover:text-foreground" onClick={() => navigate("/usuarios/web")}>
              Usuarios web
            </button>
            <span aria-hidden>/</span>
            <span className="font-medium text-foreground">Nuevo usuario web</span>
          </nav>
          <div className="flex items-start gap-2 sm:items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/usuarios/web")}
              aria-label="Volver a usuarios web"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Nuevo usuario web</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="text-primary">*</span> Indica que el campo es obligatorio
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:pt-1">
          <Button variant="outline" size="sm" className="h-9 font-medium" onClick={() => navigate("/usuarios/web")}>
            Cancelar
          </Button>
          <Button size="sm" className="h-9 px-6 font-medium shadow-glow" disabled={submitting} onClick={() => void handleSave()}>
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
                <Label htmlFor="nu-name" className="text-sm font-medium text-foreground">
                  <span className="text-primary">*</span> Nombre y apellido
                </Label>
                <Input
                  id="nu-name"
                  className="h-10 bg-background"
                  placeholder="Ej. María García López"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nu-username" className="text-sm font-medium text-foreground">
                  <span className="text-primary">*</span> Nombre de usuario
                </Label>
                <Input
                  id="nu-username"
                  className="h-10 bg-background"
                  placeholder="sin_espacios"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Nombre único para entrar a la plataforma. No debe contener espacios.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nu-email" className="text-sm font-medium text-foreground">
                  <span className="text-primary">*</span> Email
                </Label>
                <Input
                  id="nu-email"
                  type="email"
                  className="h-10 bg-background"
                  placeholder="correo@empresa.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nu-password" className="text-sm font-medium text-foreground">
                  <span className="text-primary">*</span> Contraseña
                </Label>
                <Input
                  id="nu-password"
                  type="password"
                  className="h-10 bg-background"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nu-password2" className="text-sm font-medium text-foreground">
                  <span className="text-primary">*</span> Repite contraseña
                </Label>
                <Input
                  id="nu-password2"
                  type="password"
                  className="h-10 bg-background"
                  autoComplete="new-password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 border-b border-border bg-muted/35 px-5 py-3 text-left transition-colors hover:bg-muted/50"
              onClick={() => setPermissionsExpanded((v) => !v)}
              aria-expanded={permissionsExpanded}
            >
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Permisos</h2>
              <span className="text-muted-foreground">
                {permissionsExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </span>
            </button>

            {permissionsExpanded && (
              <div className="space-y-6 p-5">
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
                    <RadioGroupItem value="rol" id="nu-rol" />
                    <Label htmlFor="nu-rol" className="cursor-pointer text-sm font-medium text-foreground">
                      Rol de usuario
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="personalizado" id="nu-custom" />
                    <Label htmlFor="nu-custom" className="cursor-pointer text-sm font-medium text-foreground">
                      Personalizado
                    </Label>
                  </div>
                </RadioGroup>

                {permissionType === "rol" && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Label htmlFor="nu-role-select" className="text-sm font-medium text-foreground">
                        Seleccionar rol
                      </Label>
                      <Select value={selectedRole || undefined} onValueChange={setSelectedRole}>
                        <SelectTrigger id="nu-role-select" className="h-10 bg-background">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[min(50vh,280px)]">
                          {roleOptions.length === 0 ? (
                            <div className="px-2 py-3 text-xs text-muted-foreground">No hay roles activos. Crea uno en Roles de usuario.</div>
                          ) : (
                            roleOptions.map((r) => (
                              <SelectItem key={r.clave} value={r.clave} className="text-sm">
                                {r.nombre}
                              </SelectItem>
                            ))
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

export default NuevoUsuarioWeb;
