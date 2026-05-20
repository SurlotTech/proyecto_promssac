import { apiGet, apiPost } from "@/lib/api";

export interface NotificationSendRequest {
  destinatarioEmail: string;
  destinatarioNombre?: string;
  asunto: string;
  contenidoPlano?: string;
  contenidoHtml?: string;
  tipo?: string;
  ordenCodigo?: string;
}

export interface NotificationSendResponse {
  messageId: string;
  estado: string;
}

export interface NotificacionEnviadaListResponse {
  id: string;
  destinatarioEmail: string;
  destinatarioNombre: string | null;
  asunto: string;
  contenido: string | null;
  messageId: string | null;
  estado: string;
  tipo: string | null;
  ordenCodigo: string | null;
  enviadoEn: string;
}

export interface NotificacionPage {
  content: NotificacionEnviadaListResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ClienteAutocompleteItem {
  id: string;
  email: string;
  nombreIiee: string;
  director: string;
  codigoModular: string;
}

export const notificacionesApi = {
  enviar(body: NotificationSendRequest): Promise<NotificationSendResponse> {
    return apiPost<NotificationSendResponse, NotificationSendRequest>(
      "/api/v1/notificaciones/enviar",
      body
    );
  },

  listar(page = 0, size = 20): Promise<NotificacionPage> {
    return apiGet<NotificacionPage>(
      `/api/v1/notificaciones?page=${page}&size=${size}`
    );
  },

  detalle(id: string): Promise<NotificacionEnviadaListResponse> {
    return apiGet<NotificacionEnviadaListResponse>(`/api/v1/notificaciones/${id}`);
  },

  buscarClientes(query: string): Promise<ClienteAutocompleteItem[]> {
    return apiGet<ClienteAutocompleteItem[]>(
      `/api/v1/clientes/autocomplete-email?q=${encodeURIComponent(query)}`
    );
  },
};
