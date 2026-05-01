package com.promssac.backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Respuesta mínima para combos (id + placa + tipo). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehicleOptionResponse {

    private String id;
    private String plate;
    private String type;
}
