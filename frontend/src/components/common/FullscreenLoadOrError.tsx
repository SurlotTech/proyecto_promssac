import { Button } from "@/components/ui/button";

type Props = {
  variant: "loading" | "error";
  onBack: () => void;
  loadingText?: string;
  errorText?: string;
  backLabel?: string;
};

export function FullscreenLoadOrError({
  variant,
  onBack,
  loadingText = "Cargando…",
  errorText = "No se pudo cargar el recurso. Revisa el enlace o el backend.",
  backLabel = "Volver al listado",
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 bg-background p-8 animate-fade-in">
      {variant === "loading" ? (
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      ) : (
        <p className="text-center text-sm text-destructive">{errorText}</p>
      )}
      <Button variant="outline" size="sm" onClick={onBack}>
        {backLabel}
      </Button>
    </div>
  );
}
