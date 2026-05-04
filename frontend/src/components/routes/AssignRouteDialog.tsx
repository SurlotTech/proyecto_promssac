import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Route as RouteRow } from "@/domain/routes";
import { useAssignRouteDialog } from "@/hooks/useAssignRouteDialog";
import AssignRouteOrdersPanel from "@/components/routes/AssignRouteOrdersPanel";
import AssignRouteRoutesPanel from "@/components/routes/AssignRouteRoutesPanel";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routes: RouteRow[];
}

const AssignRouteDialog = ({ open, onOpenChange, routes }: Props) => {
  const navigate = useNavigate();
  const {
    dayIso,
    onDateInputChange,
    loadingOrders,
    ordersDelDia,
    rutasDelDia,
    orderSearch,
    setOrderSearch,
    routeSearch,
    setRouteSearch,
    orderStatusFilter,
    setOrderStatusFilter,
    routeStatusFilter,
    setRouteStatusFilter,
    selectedOrders,
    selectedRouteId,
    toggleOrder,
    selectRoute,
    handleGuardar,
    assigning,
  } = useAssignRouteDialog(open, routes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl gap-0 overflow-hidden bg-background p-0 [&>button.absolute]:hidden">
        <DialogHeader className="sticky top-0 z-10 flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
          <DialogTitle className="text-lg font-semibold text-foreground sm:text-xl">Asignar rutas</DialogTitle>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Input
              id="assign-date-header"
              type="date"
              value={dayIso}
              onChange={(e) => onDateInputChange(e.target.value)}
              aria-label="Fecha de trabajo"
              className="h-9 w-[11rem] shrink-0 tabular-nums"
            />
            <Button
              type="button"
              className="h-9 bg-primary shadow-glow hover:bg-primary-hover"
              disabled={assigning}
              onClick={() => void handleGuardar(() => onOpenChange(false))}
            >
              {assigning ? "Guardando…" : "Guardar"}
            </Button>
            <DialogClose asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="grid h-[calc(85vh-88px)] min-h-[420px] grid-cols-1 md:grid-cols-2">
          <AssignRouteOrdersPanel
            dayIso={dayIso}
            loadingOrders={loadingOrders}
            orders={ordersDelDia}
            orderStatusFilter={orderStatusFilter}
            onOrderStatusFilterChange={setOrderStatusFilter}
            orderSearch={orderSearch}
            onOrderSearchChange={setOrderSearch}
            selectedOrderIds={selectedOrders}
            onToggleOrder={toggleOrder}
            onNuevaOrden={() => {
              onOpenChange(false);
              navigate("/ordenes");
            }}
          />
          <AssignRouteRoutesPanel
            dayIso={dayIso}
            routes={rutasDelDia}
            routeStatusFilter={routeStatusFilter}
            onRouteStatusFilterChange={setRouteStatusFilter}
            routeSearch={routeSearch}
            onRouteSearchChange={setRouteSearch}
            selectedRouteId={selectedRouteId}
            onSelectRoute={selectRoute}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRouteDialog;
