package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EstadoResponse {
    private String id;
    private String nombre;
    private String parentId;
    private String parentNombre;
    private Boolean activo;
    private Boolean esPadre;
}
