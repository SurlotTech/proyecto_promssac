package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WebUserListItemResponse {

    private String id;
    private String nombreCompleto;
    private String nombreUsuario;
    private String estado;
    private String rolPermisos;
    private String ultimaConexion;
}
