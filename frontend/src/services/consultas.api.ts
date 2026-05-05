import { apiGet } from "@/lib/api";
import { endpoints } from "./endpoints";

export interface DocumentoConsultaDto {
  exito: boolean;
  mensaje: string | null;
  nombreMostrar: string | null;
  direccionSugerida: string | null;
}

export const consultasApi = {
  dni(numero: string): Promise<DocumentoConsultaDto> {
    return apiGet<DocumentoConsultaDto>(`${endpoints.consultas}/dni/${encodeURIComponent(numero)}`);
  },

  ruc(numero: string): Promise<DocumentoConsultaDto> {
    return apiGet<DocumentoConsultaDto>(`${endpoints.consultas}/ruc/${encodeURIComponent(numero)}`);
  },
};
