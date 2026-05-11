import type { Client } from "@/domain/clients";

/** Campos de texto que participan en el buscador único de la lista de clientes. */
function valoresBusquedaCliente(c: Client): string[] {
  return [
    c.nombre,
    c.codigoRegional,
    c.codigoModularIiee,
    c.ugel,
    c.departamento,
    c.provincia,
    c.distrito,
    c.centroPoblado,
    c.direccion,
    c.email,
    c.telefono,
    c.nombreApellidosDirectorIiee,
    c.nivelEducacion,
  ];
}

/** `q` ya en minúsculas y sin espacios extremos. */
export function clienteCoincideBusqueda(c: Client, q: string): boolean {
  if (!q) return true;
  for (const s of valoresBusquedaCliente(c)) {
    if ((s ?? "").toLowerCase().includes(q)) return true;
  }
  return false;
}
