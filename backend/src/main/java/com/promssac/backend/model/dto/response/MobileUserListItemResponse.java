package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MobileUserListItemResponse {

    private String id;
    private String nombreCompleto;
    private String nombreUsuario;
    private String estado;
    /** Hasta que exista tipo en BD, valor fijo para la tabla. */
    private String tipoUsuario;
    /** Etiqueta legible del tipo de vehículo asociado (p. ej. Furgón). */
    private String vehiculoTipo;

    private String vehiculoAsignado;
    private String fechaCreacion;
    private int diasActivo;
}
