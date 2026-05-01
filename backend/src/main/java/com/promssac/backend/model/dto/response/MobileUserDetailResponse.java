package com.promssac.backend.model.dto.response;

import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MobileUserDetailResponse {

    private String id;
    private String nombreCompleto;
    private String nombreUsuario;
    private String telefono;
    private Boolean fotoAprobada;
    private String vehicleMode;
    private String vehicleId;
    private String createVehicleType;
    private String createVehicleName;
    private Map<String, Boolean> permissions;
    private String fotoUrl;
}
