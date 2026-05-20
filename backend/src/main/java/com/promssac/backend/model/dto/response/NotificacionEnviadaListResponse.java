package com.promssac.backend.model.dto.response;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class NotificacionEnviadaListResponse {

    private String id;
    private String destinatarioEmail;
    private String destinatarioNombre;
    private String asunto;
    private String contenido;
    private String messageId;
    private String estado;
    private String tipo;
    private String ordenCodigo;
    private Instant enviadoEn;
}
