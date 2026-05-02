package com.promssac.backend.model.dto.response;

import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RolWebDetailResponse {

    private String id;
    private String clave;
    private String nombre;
    private String descripcion;
    private boolean activo;
    private Map<String, Boolean> permissions;
}
