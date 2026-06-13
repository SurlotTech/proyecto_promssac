package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Payload mínimo para asignar rutas (combo conductor + vehículo enlazado).
 * Evita devolver el listado completo de usuario móvil.
 */
@Getter
@Setter
@NoArgsConstructor
public class MobileUserRouteOptionResponse {

    private String id;
    private String nombreCompleto;
    /** UUID del vehículo asignado al usuario; vacío si no aplica. */
    private String vehiculoId;
    private String telefono;
}
