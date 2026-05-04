import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { ordersApi } from "@/services/orders.api";
import type { Route } from "@/domain/routes";
import {
  filterOrdersForAssignPanel,
  filterRoutesForAssignPanel,
  formatAssignDayIso,
  type AssignOrderStatusFilter,
  type AssignRouteStatusFilter,
} from "@/lib/assignRouteFilters";
import { toast } from "sonner";
import { errorMessageFromUnknown } from "@/lib/utils";

export function useAssignRouteDialog(open: boolean, routes: Route[]) {
  const queryClient = useQueryClient();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(() => new Date());
  const [orderSearch, setOrderSearch] = useState("");
  const [routeSearch, setRouteSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<AssignOrderStatusFilter>("all");
  const [routeStatusFilter, setRouteStatusFilter] = useState<AssignRouteStatusFilter>("all");

  const assignMutation = useMutation({
    mutationFn: ordersApi.assignBulk,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ordenes"] });
    },
  });

  useEffect(() => {
    if (!open) return;
    setOrderSearch("");
    setRouteSearch("");
    setOrderStatusFilter("all");
    setRouteStatusFilter("all");
    setSelectedOrders([]);
    setSelectedRouteId(null);
  }, [open]);

  const { data: allOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["ordenes"],
    queryFn: () => ordersApi.list(),
    enabled: open,
  });

  const dayIso = formatAssignDayIso(date);

  const ordersDelDia = useMemo(
    () => filterOrdersForAssignPanel(allOrders, date, orderStatusFilter, orderSearch),
    [allOrders, date, orderStatusFilter, orderSearch],
  );

  const rutasDelDia = useMemo(
    () => filterRoutesForAssignPanel(routes, date, routeStatusFilter, routeSearch),
    [routes, date, routeStatusFilter, routeSearch],
  );

  const toggleOrder = useCallback((id: string) => {
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const selectRoute = useCallback((id: string) => {
    setSelectedRouteId((prev) => (prev === id ? null : id));
  }, []);

  const onDateInputChange = useCallback((value: string) => {
    if (!value) return;
    try {
      setDate(parseISO(value));
    } catch {
      /* ignore */
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedOrders([]);
    setSelectedRouteId(null);
  }, []);

  const handleGuardar = useCallback(
    async (onClose: () => void) => {
      if (selectedOrders.length === 0) {
        toast.error("Selecciona al menos una orden.");
        return;
      }
      if (!selectedRouteId) {
        toast.error("Selecciona una ruta.");
        return;
      }
      try {
        await assignMutation.mutateAsync({
          rutaId: selectedRouteId,
          numerosOrden: selectedOrders,
        });
        toast.success("Ruta asignada a las órdenes seleccionadas.");
        onClose();
        clearSelection();
      } catch (e) {
        toast.error(errorMessageFromUnknown(e, "No se pudo asignar la ruta."));
      }
    },
    [assignMutation, selectedOrders, selectedRouteId, clearSelection],
  );

  return {
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
    assigning: assignMutation.isPending,
  };
}
