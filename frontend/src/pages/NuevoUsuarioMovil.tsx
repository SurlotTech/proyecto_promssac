import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MobileUserVehicleMode } from "@/domain/mobileUsers";
import {
  defaultMobileUserPermissions,
  isMobileUserPinValid,
  MAX_MOBILE_USER_PHOTO_BYTES,
  mobileUserPermissionsFromApi,
  MOBILE_USER_PERM_LEFT_ORDER,
  MOBILE_USER_PERMISSION_KEYS,
  MOBILE_USER_PERMISSION_LABELS,
  MOBILE_USER_PERM_RIGHT_TAIL,
  type MobileUserPermissionKey,
} from "@/domain/mobileUserForm";
import { vehicleOptionLabel, VEHICLE_TYPE_OPTIONS } from "@/domain/vehicles";
import { FullscreenLoadOrError } from "@/components/common/FullscreenLoadOrError";
import { mobileUsersApi } from "@/services/mobileUsers.api";
import { useMobileUserDetailQuery, useVehicleOptionsQuery } from "@/hooks/useOperationsQueries";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const FormSectionTitle = ({ children }: { children: ReactNode }) => (
  <div className="border-b border-border bg-muted/35 px-5 py-3">
    <h2 className="text-sm font-semibold tracking-tight text-foreground">{children}</h2>
  </div>
);

const NuevoUsuarioMovil = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEdit = Boolean(editId);
  const queryClient = useQueryClient();
  const goToList = () => navigate("/usuarios/movil");
  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
  } = useMobileUserDetailQuery(isEdit ? editId : undefined);
  const { data: vehicles = [], isLoading: vehiclesLoading, isError: vehiclesError } = useVehicleOptionsQuery();
  const hydratedRef = useRef(false);
  const [vehicleMode, setVehicleMode] = useState<MobileUserVehicleMode>("list");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [createVehicleType, setCreateVehicleType] = useState<string>("");
  const [createVehicleName, setCreateVehicleName] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [photoApproved, setPhotoApproved] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [perms, setPerms] = useState<Record<MobileUserPermissionKey, boolean>>(
    () => ({ ...defaultMobileUserPermissions }),
  );

  const allSelected = MOBILE_USER_PERMISSION_KEYS.every((k) => perms[k]);

  useEffect(() => {
    hydratedRef.current = false;
  }, [editId]);

  useEffect(() => {
    if (!isEdit || !detail) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    setFullName(detail.nombreCompleto);
    setUsername(detail.nombreUsuario);
    setPassword("");
    setPhone(detail.telefono ?? "");
    setPhotoApproved(Boolean(detail.fotoAprobada));
    setPhotoFile(null);

    const mode = detail.vehicleMode === "create" ? "create" : "list";
    setVehicleMode(mode);
    setSelectedVehicleId(mode === "list" ? detail.vehicleId : "");
    setCreateVehicleType(mode === "create" ? (detail.createVehicleType ?? "") : "");
    setCreateVehicleName(mode === "create" ? (detail.createVehicleName ?? "") : "");

    setPerms(mobileUserPermissionsFromApi(detail.permissions));
  }, [isEdit, detail]);

  const blobPreviewUrl = useMemo(() => (photoFile ? URL.createObjectURL(photoFile) : null), [photoFile]);
  useEffect(() => {
    return () => {
      if (blobPreviewUrl) URL.revokeObjectURL(blobPreviewUrl);
    };
  }, [blobPreviewUrl]);

  const displayPhotoSrc =
    blobPreviewUrl ?? (isEdit && detail?.fotoUrl ? `${API_BASE}${detail.fotoUrl}` : null);

  const onFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen.");
      return;
    }
    if (f.size > MAX_MOBILE_USER_PHOTO_BYTES) {
      toast.error("La imagen no puede superar 10 MB.");
      return;
    }
    setPhotoFile(f);
  };

  const setPerm = (key: MobileUserPermissionKey, val: boolean) => {
    setPerms((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "agregar_ordenes" && !val) {
        next.crear_ordenes = false;
        next.solo_geocerca = false;
      }
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setPerms(() => {
      const next = { ...defaultMobileUserPermissions };
      MOBILE_USER_PERMISSION_KEYS.forEach((k) => {
        next[k] = checked;
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    const nombre = fullName.trim();
    const usuario = username.trim();
    if (!nombre) {
      toast.error("Indica el nombre completo.");
      return;
    }
    if (!usuario) {
      toast.error("Indica el nombre de usuario.");
      return;
    }
    const pin = password.trim();
    if (!isEdit && !isMobileUserPinValid(pin)) {
      toast.error("La contraseña debe ser numérica y de 4 dígitos.");
      return;
    }
    if (isEdit && pin.length > 0 && !isMobileUserPinValid(pin)) {
      toast.error("Si cambias la contraseña, debe ser numérica y de 4 dígitos (o déjala vacía).");
      return;
    }
    if (vehicleMode === "list" && !selectedVehicleId) {
      toast.error("Selecciona un vehículo de la lista o elige crear vehículo.");
      return;
    }
    if (vehicleMode === "create") {
      if (!createVehicleType) {
        toast.error("Selecciona el tipo de vehículo a crear.");
        return;
      }
      if (!createVehicleName.trim()) {
        toast.error("Indica el nombre del vehículo.");
        return;
      }
    }

    const payloadBase = {
      nombreCompleto: nombre,
      nombreUsuario: usuario,
      telefono: phone.trim() || undefined,
      fotoAprobada: photoApproved,
      vehicleMode,
      vehicleId: vehicleMode === "list" ? selectedVehicleId : undefined,
      createVehicleType: vehicleMode === "create" ? createVehicleType : undefined,
      createVehicleName: vehicleMode === "create" ? createVehicleName.trim() : undefined,
      permissions: { ...perms },
    };

    setSubmitting(true);
    try {
      if (isEdit && editId) {
        await mobileUsersApi.update(
          editId,
          {
            ...payloadBase,
            ...(isMobileUserPinValid(pin) ? { contrasena: pin } : {}),
          },
          photoFile,
        );
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["usuarios-movil"] }),
          queryClient.invalidateQueries({ queryKey: ["usuario-movil", editId] }),
        ]);
        toast.success("Usuario móvil actualizado correctamente.");
      } else {
        await mobileUsersApi.create({ ...payloadBase, contrasena: pin }, photoFile);
        await queryClient.invalidateQueries({ queryKey: ["usuarios-movil"] });
        toast.success("Usuario móvil creado correctamente.");
      }
      goToList();
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : isEdit
            ? "No se pudo actualizar el usuario móvil."
            : "No se pudo crear el usuario móvil.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const subsDisabled = !perms.agregar_ordenes;

  if (isEdit && detailLoading) {
    return <FullscreenLoadOrError variant="loading" onBack={goToList} loadingText="Cargando usuario…" />;
  }

  if (isEdit && (detailError || !detail)) {
    return (
      <FullscreenLoadOrError
        variant="error"
        onBack={goToList}
        errorText="No se pudo cargar el usuario. Revisa el enlace o el backend."
      />
    );
  }

  const pageTitle = isEdit ? "Editar usuario móvil" : "Nuevo usuario móvil";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent animate-fade-in">
      <header className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <nav className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
            <button type="button" className="hover:text-foreground" onClick={goToList}>
              Usuarios móviles
            </button>
            <span aria-hidden>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </nav>
          <div className="flex items-start gap-2 sm:items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={goToList}
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="text-primary">*</span> Indica que el campo es obligatorio
              </p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-1">
          <Button variant="outline" size="sm" className="h-9 font-medium" onClick={goToList}>
            Cancelar
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6 pb-8">
          <section className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm">
            <FormSectionTitle>Usuario</FormSectionTitle>
            <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[1fr_280px] lg:items-start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nm-name" className="text-sm font-medium text-foreground">
                    <span className="text-primary">*</span> Nombre
                  </Label>
                  <Input
                    id="nm-name"
                    className="h-10 bg-transparent"
                    placeholder="Nombre completo"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nm-user" className="text-sm font-medium text-foreground">
                    <span className="text-primary">*</span> Nombre de usuario
                  </Label>
                  <Input
                    id="nm-user"
                    className="h-10 bg-transparent"
                    placeholder="sin_espacios"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nm-pass" className="text-sm font-medium text-foreground">
                    {isEdit ? (
                      "Nueva contraseña (opcional)"
                    ) : (
                      <>
                        <span className="text-primary">*</span> Contraseña
                      </>
                    )}
                  </Label>
                  <Input
                    id="nm-pass"
                    inputMode="numeric"
                    maxLength={4}
                    className="h-10 bg-transparent tracking-widest"
                    placeholder="••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isEdit
                      ? "4 dígitos. Déjala vacía para no cambiar la contraseña actual."
                      : "4 dígitos numéricos"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nm-phone" className="text-sm font-medium text-foreground">
                    Teléfono
                  </Label>
                  <Input
                    id="nm-phone"
                    type="tel"
                    className="h-10 bg-transparent"
                    placeholder="+51 999 999 999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col rounded-xl border border-border bg-muted/20 p-5">
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={onFotoChange}
                />
                <div className="flex flex-col items-center text-center">
                  <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-transparent text-muted-foreground">
                    {displayPhotoSrc ? (
                      <img src={displayPhotoSrc} alt="" className="size-full object-cover" />
                    ) : (
                      <User className="size-14 opacity-60" aria-hidden />
                    )}
                  </div>
                  <button
                    type="button"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                    onClick={() => fotoInputRef.current?.click()}
                  >
                    <Upload className="size-4 shrink-0" aria-hidden />
                    {photoFile ? "Cambiar imagen" : "Seleccionar imagen"}
                  </button>
                  {photoFile ? (
                    <div className="mt-2 flex w-full max-w-full items-center justify-center gap-2">
                      <p className="truncate text-xs text-muted-foreground" title={photoFile.name}>
                        {photoFile.name}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label="Quitar imagen"
                        onClick={() => setPhotoFile(null)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">JPEG, PNG, WebP o GIF · máx. 10 MB</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-border/80 pt-4">
                  <Checkbox
                    id="nm-photo-ok"
                    checked={photoApproved}
                    onCheckedChange={(v) => setPhotoApproved(v === true)}
                  />
                  <Label htmlFor="nm-photo-ok" className="cursor-pointer text-sm font-medium text-foreground">
                    Foto aprobada
                  </Label>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm">
            <FormSectionTitle>Identificador de vehículo</FormSectionTitle>
            <div className="p-5">
              <RadioGroup
                value={vehicleMode}
                onValueChange={(v) => {
                  const m = v as MobileUserVehicleMode;
                  setVehicleMode(m);
                  if (m === "create") setSelectedVehicleId("");
                  if (m === "list") {
                    setCreateVehicleType("");
                    setCreateVehicleName("");
                  }
                }}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <label
                  className={cn(
                    "flex cursor-pointer flex-col gap-4 rounded-xl border p-4 transition-colors",
                    vehicleMode === "list"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card/40 backdrop-blur-lg hover:bg-muted/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="list" id="nm-v-list" className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-foreground">Seleccionar vehículo</span>
                    </div>
                  </div>
                  <div className={cn("pl-7", vehicleMode !== "list" && "pointer-events-none opacity-50")}>
                    <Select
                      disabled={vehicleMode !== "list" || vehiclesLoading}
                      value={selectedVehicleId || undefined}
                      onValueChange={setSelectedVehicleId}
                    >
                      <SelectTrigger className="h-10 bg-transparent">
                        <SelectValue placeholder={vehiclesLoading ? "Cargando…" : "Seleccionar vehículo"} />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.length === 0 && !vehiclesLoading ? (
                          <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                            No hay vehículos registrados
                          </div>
                        ) : (
                          vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {vehicleOptionLabel(v)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {vehicleMode === "list" && vehiclesError ? (
                      <p className="text-xs text-destructive">No se pudo cargar la lista. Revisa el backend.</p>
                    ) : null}
                  </div>
                </label>

                <label
                  className={cn(
                    "flex cursor-pointer flex-col gap-4 rounded-xl border p-4 transition-colors",
                    vehicleMode === "create"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card/40 backdrop-blur-lg hover:bg-muted/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="create" id="nm-v-create" className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-foreground">Crear vehículo</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end pl-7",
                      vehicleMode !== "create" && "pointer-events-none opacity-50",
                    )}
                  >
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Tipo de vehículo</Label>
                      <Select
                        disabled={vehicleMode !== "create"}
                        value={createVehicleType || undefined}
                        onValueChange={setCreateVehicleType}
                      >
                        <SelectTrigger className="h-10 bg-transparent">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {VEHICLE_TYPE_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nm-v-name" className="text-xs font-medium text-muted-foreground">
                        Nombre del vehículo
                      </Label>
                      <Input
                        id="nm-v-name"
                        disabled={vehicleMode !== "create"}
                        className="h-10 bg-transparent"
                        placeholder="Ej. Unidad 12"
                        value={createVehicleName}
                        onChange={(e) => setCreateVehicleName(e.target.value)}
                      />
                    </div>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-lg shadow-sm">
            <FormSectionTitle>Permisos</FormSectionTitle>
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/25 px-3 py-2.5">
                <Checkbox
                  id="nm-perm-all"
                  checked={allSelected}
                  onCheckedChange={(v) => toggleSelectAll(v === true)}
                />
                <Label htmlFor="nm-perm-all" className="cursor-pointer text-sm font-medium text-foreground">
                  Seleccionar todos
                </Label>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
                <div className="space-y-3">
                  {MOBILE_USER_PERM_LEFT_ORDER.map((key) => (
                    <PermRow
                      key={key}
                      permKey={key}
                      checked={perms[key]}
                      onCheckedChange={(c) => setPerm(key, c)}
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  <PermRow
                    permKey="reordenar_ruta"
                    checked={perms.reordenar_ruta}
                    onCheckedChange={(c) => setPerm("reordenar_ruta", c)}
                  />
                  <div className="space-y-2">
                    <PermRow
                      permKey="agregar_ordenes"
                      checked={perms.agregar_ordenes}
                      onCheckedChange={(c) => setPerm("agregar_ordenes", c)}
                    />
                    <div className={cn("ml-6 space-y-2 border-l-2 border-border pl-3", subsDisabled && "opacity-45")}>
                      <PermRow
                        permKey="crear_ordenes"
                        checked={perms.crear_ordenes}
                        disabled={subsDisabled}
                        onCheckedChange={(c) => setPerm("crear_ordenes", c)}
                      />
                      <PermRow
                        permKey="solo_geocerca"
                        checked={perms.solo_geocerca}
                        disabled={subsDisabled}
                        onCheckedChange={(c) => setPerm("solo_geocerca", c)}
                      />
                    </div>
                  </div>
                  {MOBILE_USER_PERM_RIGHT_TAIL.map((key) => (
                    <PermRow
                      key={key}
                      permKey={key}
                      checked={perms[key]}
                      onCheckedChange={(c) => setPerm(key, c)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
          <div className="mt-6 flex justify-center">
            <Button
              size="lg"
              className="min-w-[200px] rounded-full px-10 shadow-glow"
              onClick={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? (isEdit ? "Guardando…" : "Creando…") : isEdit ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

function PermRow({
  permKey,
  checked,
  disabled,
  onCheckedChange,
}: {
  permKey: MobileUserPermissionKey;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (c: boolean) => void;
}) {
  const id = `nm-perm-${permKey}`;
  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5"
      />
      <Label
        htmlFor={id}
        className={cn("cursor-pointer text-sm leading-snug text-foreground", disabled && "cursor-not-allowed")}
      >
        {MOBILE_USER_PERMISSION_LABELS[permKey]}
      </Label>
    </div>
  );
}

export default NuevoUsuarioMovil;
