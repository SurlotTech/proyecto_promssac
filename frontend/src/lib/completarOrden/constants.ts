import type { Step } from "@/components/ui/stepper";

export const selectTriggerClass =
  "h-9 w-full border-border/80 bg-background px-3 text-sm shadow-sm transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:ring-offset-0 [&>span]:line-clamp-1 [&>span]:w-full [&>span]:truncate [&>span]:text-left [&>span]:font-semibold [&>span]:text-foreground [&>span[data-placeholder]]:font-normal [&>span[data-placeholder]]:text-muted-foreground";

export const fieldInputClass =
  "h-9 border-border/80 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-ring";

export const customFieldKeys = [
  "director",
  "telefono_director",
  "paquetes",
  "actaEntrega",
  "guiaRemision",
  "guiaTransportista",
] as const;

export type CustomFieldKey = (typeof customFieldKeys)[number];

export const customFieldLabels: Record<CustomFieldKey, string> = {
  director: "Director",
  telefono_director: "Teléfono Director",
  paquetes: "Paquetes",
  actaEntrega: "Acta de entrega",
  guiaRemision: "Guía de remisión",
  guiaTransportista: "Guía de transportista",
};

export const COMPLETAR_ORDEN_STEPS: Step[] = [
  { id: "order", title: "Datos de orden", description: "ID, fecha, ruta" },
  { id: "contact", title: "Contacto", description: "Nombre, teléfono" },
  { id: "address", title: "Dirección", description: "Envío y mapa" },
  { id: "custom", title: "Personalizados", description: "Campos extra" },
];

export const STEP_VALIDATION_LABELS = ["Datos de orden", "Datos de contacto", "Dirección"] as const;
