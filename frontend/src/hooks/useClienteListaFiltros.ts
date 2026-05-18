import { useCallback, useState } from "react";
import type { Client } from "@/domain/clients";
import { clienteCoincideBusqueda } from "@/lib/clienteListaFiltros";

export type ClienteListaFiltrosApi = {
  busqueda: string;
  estadoFiltro: "activos" | "inactivos";
  setBusqueda: (v: string) => void;
  setEstadoFiltro: (v: "activos" | "inactivos") => void;
  limpiarBusqueda: () => void;
  aplicarFiltroLista: (lista: Client[]) => Client[];
};

export function useClienteListaFiltros(): ClienteListaFiltrosApi {
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"activos" | "inactivos">("activos");

  const aplicarFiltroLista = useCallback(
    (list: Client[]) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return list;
      return list.filter((c) => clienteCoincideBusqueda(c, q));
    },
    [busqueda],
  );

  return {
    busqueda,
    estadoFiltro,
    setBusqueda,
    setEstadoFiltro,
    limpiarBusqueda: () => {
      setBusqueda("");
    },
    aplicarFiltroLista,
  };
}
