import type { RouteFilters } from "@/components/routes/RouteFilters";
import type { Route } from "@/domain/routes";

function deliveryUiAsDate(deliveryDateDdMmYyyy: string): Date {
  return new Date(deliveryDateDdMmYyyy.split("/").reverse().join("-"));
}

/** Filtrado cliente para la página de rutas (misma semántica que antes). */
export function routeMatchesFilters(r: Route, f: RouteFilters): boolean {
  if (f.search) {
    const q = f.search.toLowerCase();
    const hay =
      r.id.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.vehiclePlate.toLowerCase().includes(q);
    if (!hay) return false;
  }
  if (f.vehicle !== "all" && r.vehicleId !== f.vehicle) return false;
  if (f.place !== "all" && r.place !== f.place) return false;
  if (f.driver !== "all" && r.mobileUser !== f.driver) return false;

  if (f.dateFrom) {
    const routeDate = deliveryUiAsDate(r.deliveryDate);
    const fromDate = new Date(f.dateFrom);
    if (routeDate < fromDate) return false;
  }
  if (f.dateTo) {
    const routeDate = deliveryUiAsDate(r.deliveryDate);
    const toDate = new Date(f.dateTo);
    if (routeDate > toDate) return false;
  }
  return true;
}
