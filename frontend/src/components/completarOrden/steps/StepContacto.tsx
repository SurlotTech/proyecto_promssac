import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fieldInputClass, selectTriggerClass } from "@/lib/completarOrden/constants";
import {
  isOptionalEmailValid,
  isValidPeruMobileNineDigits,
} from "@/lib/completarOrden/contactValidation";
import { cn } from "@/lib/utils";

interface Props {
  idType: string;
  onIdTypeChange: (v: string) => void;
  contactIdentifier: string;
  onContactIdentifierChange: (v: string) => void;
  consultandoDocumento: boolean;
  contactName: string;
  onContactNameChange: (v: string) => void;
  contactPhone: string;
  onContactPhoneChange: (v: string) => void;
  contactEmail: string;
  onContactEmailChange: (v: string) => void;
}

const StepContacto = ({
  idType,
  onIdTypeChange,
  contactIdentifier,
  onContactIdentifierChange,
  consultandoDocumento,
  contactName,
  onContactNameChange,
  contactPhone,
  onContactPhoneChange,
  contactEmail,
  onContactEmailChange,
}: Props) => {
  const phonePartialInvalid =
    contactPhone.length > 0 && !isValidPeruMobileNineDigits(contactPhone);
  const emailInvalid = contactEmail.trim().length > 0 && !isOptionalEmailValid(contactEmail);

  return (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">
        Identificador <span className="text-primary">*</span>
      </Label>
      <div className="flex gap-2">
        <Select value={idType} onValueChange={onIdTypeChange}>
          <SelectTrigger className={cn(selectTriggerClass, "w-[100px] shrink-0 uppercase")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dni">DNI</SelectItem>
            <SelectItem value="ruc">RUC</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Input
            id="co-identifier"
            value={contactIdentifier}
            onChange={(e) => {
              const val = e.target.value;
              if (idType === "dni" || idType === "ruc") {
                onContactIdentifierChange(val.replace(/\D/g, ""));
              } else {
                onContactIdentifierChange(val);
              }
            }}
            placeholder={
              idType === "dni" ? "8 dígitos" : idType === "ruc" ? "11 dígitos" : "Número de documento"
            }
            className={cn(fieldInputClass, "min-w-0 flex-1")}
            inputMode="numeric"
            autoComplete="off"
          />
          {consultandoDocumento ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-label="Consultando documento" />
          ) : null}
        </div>
      </div>
      {idType === "dni" ? (
        <p className="text-xs text-muted-foreground">
          Con 8 dígitos se consulta RENIEC y se completa el nombre automáticamente.
        </p>
      ) : idType === "ruc" ? (
        <p className="text-xs text-muted-foreground">
          Con 11 dígitos se consulta SUNAT y se completa la razón social.
        </p>
      ) : null}
    </div>

    <div className="space-y-1.5">
      <Label htmlFor="co-contact-name" className="text-sm text-muted-foreground">
        Nombre del contacto <span className="text-primary">*</span>
      </Label>
      <Input
        id="co-contact-name"
        value={contactName}
        onChange={(e) => onContactNameChange(e.target.value)}
        placeholder="Nombre completo"
        className={fieldInputClass}
        autoComplete="name"
      />
    </div>

    <div className="space-y-1.5">
      <Label htmlFor="co-phone" className="text-sm text-muted-foreground">
        Teléfono <span className="text-primary">*</span>
      </Label>
      <Input
        id="co-phone"
        value={contactPhone}
        onChange={(e) => onContactPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
        placeholder="987654321"
        maxLength={9}
        className={cn(
          fieldInputClass,
          "tabular-nums",
          phonePartialInvalid && "border-destructive focus-visible:ring-destructive",
        )}
        autoComplete="tel"
        inputMode="numeric"
      />
      <p className="text-xs text-muted-foreground">
        Obligatorio: exactamente <strong className="text-foreground">9 dígitos</strong> (celular Perú).
      </p>
      {phonePartialInvalid ? (
        <p className="text-[10px] text-destructive">Debe tener 9 dígitos numéricos.</p>
      ) : null}
    </div>

    <div className="space-y-1.5">
      <Label htmlFor="co-email" className="text-sm text-muted-foreground">
        Correo electrónico
      </Label>
      <Input
        id="co-email"
        type="email"
        value={contactEmail}
        onChange={(e) => onContactEmailChange(e.target.value)}
        placeholder="correo@ejemplo.com"
        className={cn(
          fieldInputClass,
          emailInvalid && "border-destructive focus-visible:ring-destructive",
        )}
        autoComplete="email"
      />
      <p className="text-xs text-muted-foreground">Opcional. Si lo completas, debe ser un correo válido.</p>
      {emailInvalid ? (
        <p className="text-[10px] text-destructive">Correo electrónico no válido.</p>
      ) : null}
    </div>
  </div>
  );
};

export default StepContacto;
