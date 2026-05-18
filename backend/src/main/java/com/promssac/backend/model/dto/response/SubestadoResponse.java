package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SubestadoResponse {
    private String id;
    private String nombre;
    private String estadoPadre;
    private Boolean activo;
}
