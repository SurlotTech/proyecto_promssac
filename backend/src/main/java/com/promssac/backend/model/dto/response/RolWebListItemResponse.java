package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RolWebListItemResponse {

    private String id;
    private String clave;
    private String nombre;
    private boolean activo;
    private int permisosActivos;
    private long usuariosAsignados;
    private String ultimaEdicion;
}
