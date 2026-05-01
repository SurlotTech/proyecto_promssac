package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MobileUserCreateRequest {

    @NotBlank
    @Size(max = 200)
    private String nombreCompleto;

    @NotBlank
    @Size(max = 80)
    @Pattern(regexp = "\\S+", message = "no debe contener espacios")
    private String nombreUsuario;

    @NotBlank
    @Pattern(regexp = "\\d{4}", message = "debe ser exactamente 4 dígitos")
    private String contrasena;

    @Size(max = 40)
    private String telefono;

    @NotNull
    private Boolean fotoAprobada;

    @NotBlank
    @Pattern(regexp = "(?i)list|create", message = "debe ser list o create")
    private String vehicleMode;

    @Size(max = 40)
    private String vehicleId;

    @Size(max = 30)
    private String createVehicleType;

    @Size(max = 120)
    private String createVehicleName;

    @NotNull
    private Map<String, Boolean> permissions;
}
