import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { subestadosApi } from "@/services/subestados.api";
import { toast } from "sonner";

const Hint = ({ text }: { text: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button type="button" className="text-primary hover:text-primary/80" aria-label="Más información">
        <Info className="size-4 shrink-0" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-xs text-left text-sm">
      {text}
    </TooltipContent>
  </Tooltip>
);

const LabelWithHint = ({
  htmlFor,
  required,
  children,
  hint,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) => (
  <div className="mb-2 flex items-center justify-between gap-2">
    <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {required && <span className="text-primary">* </span>}
      {children}
    </Label>
    {hint ? <Hint text={hint} /> : <span className="size-4 shrink-0" aria-hidden />}
  </div>
);

const NuevoSubestado = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState("");
  const [nombre, setNombre] = useState("");

  const createMut = useMutation({
    mutationFn: () => subestadosApi.create({ nombre: nombre.trim(), estadoPadre: estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subestados"] });
      toast.success("Subestado creado.");
      navigate("/configuracion/subestados");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Error al crear."),
  });

  const canSave = estado && nombre.trim();

  const handleSave = () => {
    if (!canSave) return;
    createMut.mutate();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent animate-fade-in">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/configuracion/subestados")}
              aria-label="Volver a subestados"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Nuevo subestado</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Aquí podrás <span className="font-medium text-foreground">crear</span> tus subestados. Son los motivos
                que el usuario móvil elige al gestionar un pedido o para cambiar el estado de una orden desde la web.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="text-primary">*</span> Indica que el campo es obligatorio
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-9 shrink-0 self-start sm:self-auto" onClick={() => navigate("/configuracion/subestados")}>
            Cancelar
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 pb-28 sm:p-6 sm:pb-24">
        <div className="mx-auto max-w-4xl">
          <section className="overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-md shadow-sm">
            <div className="border-b border-border bg-muted/30 px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">Datos del subestado</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Completa los campos obligatorios para registrar el motivo.</p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <LabelWithHint htmlFor="ns-estado" required>
                    Estado
                  </LabelWithHint>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger id="ns-estado" className="h-10 w-full bg-transparent">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entregado">Entregado</SelectItem>
                      <SelectItem value="no_entregado">No entregado</SelectItem>
                      <SelectItem value="in_route">En ruta</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <LabelWithHint htmlFor="ns-nombre" required>
                    Nombre del subestado
                  </LabelWithHint>
                  <Input
                    id="ns-nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="h-10 bg-transparent"
                    placeholder="Ej. Cliente ausente"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/15 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Button type="button" variant="outline" className="sm:min-w-[120px]" onClick={() => navigate("/configuracion/subestados")}>
                Cancelar
              </Button>
              <Button type="button" className="shadow-glow sm:min-w-[140px]" disabled={!canSave || createMut.isPending} onClick={handleSave}>
                {createMut.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NuevoSubestado;
