package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ComentarioResponse {
    private String id;
    private String texto;
    private String archivoUrl;
    private String creadoPor;
    private String creadoEn;
}
