import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultWebPermissionMap, permissionGroups, PermissionGroupCard } from "./NuevoRol";

const noop = () => {};

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const [permissionsExpanded, setPermissionsExpanded] = useState(true);
  const [activePermissions] = useState(() => ({ ...defaultWebPermissionMap() }));

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background animate-fade-in">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col">
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <button type="button" className="transition-colors hover:text-foreground" onClick={() => navigate("/usuarios/web")}>
              Usuarios web
            </button>
            <span>/</span>
            <span className="font-medium text-foreground">Perfil de usuario</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => navigate("/usuarios/web")}
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">JESUS FELICITA VELASQUEZ VASQUEZ</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" className="h-9 bg-primary px-6 font-medium text-primary-foreground shadow-glow hover:bg-primary-hover" onClick={() => navigate("/usuarios/web")}>
            Volver al listado
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="max-w-2xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="border-b border-border/50 pb-3 text-sm font-semibold text-info">Información de usuario</h2>

            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Nombre y apellido</p>
                <p className="text-sm font-medium uppercase text-foreground">JESUS FELICITA VELASQUEZ VASQUEZ</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Nombre de usuario</p>
                <p className="text-sm font-medium text-foreground">promssac@hotmail.com</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">promssac@hotmail.com</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <button
              type="button"
              className="flex cursor-pointer select-none items-center justify-between border-b border-border p-4"
              onClick={() => setPermissionsExpanded(!permissionsExpanded)}
            >
              <h2 className="text-sm font-semibold text-info">Permisos</h2>
              <span className="text-muted-foreground">
                {permissionsExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </span>
            </button>

            {permissionsExpanded && (
              <div className="space-y-6 p-5">
                <div className="space-y-2 border-b border-border/50 pb-4">
                  <p className="text-sm text-info">Rol de usuario / Personalizado</p>
                  <p className="text-sm font-medium text-muted-foreground">Personalizado</p>
                </div>

                <div className="pointer-events-none grid grid-cols-1 items-start gap-6 opacity-90 md:grid-cols-2">
                  {permissionGroups.map((group) => (
                    <PermissionGroupCard
                      key={group.id}
                      group={group}
                      activePermissions={activePermissions}
                      togglePermission={noop}
                      toggleGroup={noop}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;
