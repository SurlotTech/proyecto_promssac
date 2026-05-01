package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MobileUserResponse {

    private String id;
    private String nombreCompleto;
    private String nombreUsuario;
    private String vehiculoId;
    private String vehiculoPlaca;
    private String creadoEn;
    /** Ruta relativa para GET (vacío si no se subió foto). */
    private String fotoUrl;
}
