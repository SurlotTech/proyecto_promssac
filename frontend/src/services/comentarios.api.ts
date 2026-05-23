import { apiGet, apiPostFormData } from "@/lib/api";

export interface ComentarioDto {
  id: string;
  texto: string;
  archivoUrl: string | null;
  latitud: number | null;
  longitud: number | null;
  creadoPor: string;
  creadoEn: string;
}

export const comentariosApi = {
  list(numeroOrden: string): Promise<ComentarioDto[]> {
    return apiGet<ComentarioDto[]>(
      `/api/v1/ordenes/${encodeURIComponent(numeroOrden.trim())}/comentarios`
    );
  },

  create(
    numeroOrden: string,
    texto: string,
    archivo?: File,
    latitud?: number | null,
    longitud?: number | null,
  ): Promise<ComentarioDto> {
    const form = new FormData();
    form.append("texto", texto);
    if (archivo) form.append("archivo", archivo);
    if (latitud != null) form.append("latitud", String(latitud));
    if (longitud != null) form.append("longitud", String(longitud));
    return apiPostFormData<ComentarioDto>(
      `/api/v1/ordenes/${encodeURIComponent(numeroOrden.trim())}/comentarios`,
      form
    );
  },
};
