import { FileText, MapPin, Package, User } from "lucide-react";
import type { Step } from "@/components/ui/stepper";

export const selectTriggerClass =
  "h-12 w-full rounded-full border-border bg-transparent px-4 text-base shadow-none transition-all hover:bg-zinc-50 hover:border-zinc-300 focus:ring-2 focus:ring-ring focus:ring-offset-2 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span]:font-normal [&>span]:text-foreground [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-muted-foreground";

export const fieldInputClass =
  "h-12 rounded-full border-border bg-transparent px-4 text-base font-normal shadow-none transition-all hover:bg-zinc-50 hover:border-zinc-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const customFieldKeys = [
  "paquetes",
  "actaEntrega",
  "guiaRemision",
  "guiaTransportista",
  "telefono",
  "profesor",
  "correoElectronico",
] as const;

export type CustomFieldKey = (typeof customFieldKeys)[number];

export const customFieldLabels: Record<CustomFieldKey, string> = {
  paquetes: "Paquetes",
  actaEntrega: "Acta de entrega",
  guiaRemision: "Guía de remisión",
  guiaTransportista: "Guía de transportista",
  telefono: "Teléfono",
  profesor: "Director",
  correoElectronico: "Correo electrónico",
};

export const COMPLETAR_ORDEN_STEPS: Step[] = [
  { id: "order", title: "Datos de orden", description: "ID, fecha, ruta", icon: FileText },
  { id: "contact", title: "Contacto", description: "Nombre, teléfono", icon: User },
  { id: "address", title: "Dirección", description: "Envío y mapa", icon: MapPin },
  { id: "custom", title: "Personalizados", description: "Campos extra", icon: Package },
];

/** Paso donde están director, paquetes, guías, etc. (último del asistente). */
export const COMPLETAR_STEP_PERSONALIZADOS_INDEX = COMPLETAR_ORDEN_STEPS.length - 1;

export const STEP_VALIDATION_LABELS = [
  "Datos de orden",
  "Datos de contacto",
  "Dirección",
  "Campos extra",
] as const;
