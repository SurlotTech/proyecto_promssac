import { useCallback, useState } from "react";
import type { Client } from "@/domain/clients";
import { clienteCoincideBusqueda } from "@/lib/clienteListaFiltros";

export type ClienteListaFiltrosApi = {
  busqueda: string;
  incluirInactivos: boolean;
  setBusqueda: (v: string) => void;
  setIncluirInactivos: (v: boolean) => void;
  limpiarBusqueda: () => void;
  aplicarFiltroLista: (lista: Client[]) => Client[];
};

export function useClienteListaFiltros(): ClienteListaFiltrosApi {
  const [busqueda, setBusqueda] = useState("");
  const [incluirInactivos, setIncluirInactivos] = useState(false);

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
    incluirInactivos,
    setBusqueda,
    setIncluirInactivos,
    limpiarBusqueda: () => {
      setBusqueda("");
    },
    aplicarFiltroLista,
  };
}
