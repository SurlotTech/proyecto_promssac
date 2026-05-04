import { useQueryClient } from "@tanstack/react-query";

export const ROUTES_QUERY_KEY = ["rutas"] as const;

/** Invalida el listado de rutas tras crear/editar/borrar. */
export function useInvalidateRoutesQuery() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });
}
