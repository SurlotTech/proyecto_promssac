package com.promssac.backend.model.dto.request;

import com.promssac.backend.model.enums.EstadoVehiculo;
import com.promssac.backend.model.enums.TipoVehiculo;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoRequest {

    @NotBlank(message = "La placa es obligatoria.")
    @Size(max = 20, message = "La placa no puede superar 20 caracteres.")
    private String placa;

    @NotNull(message = "El tipo de vehículo es obligatorio.")
    private TipoVehiculo tipo;

    @NotBlank(message = "El grupo es obligatorio.")
    @Size(max = 60)
    private String grupo;

    @Size(max = 120, message = "El nombre del conductor no puede superar 120 caracteres.")
    private String conductor;

    @NotNull(message = "El estado es obligatorio.")
    private EstadoVehiculo estado;

    @NotNull(message = "La capacidad en kg es obligatoria.")
    @Positive(message = "La capacidad debe ser mayor a 0.")
    private Integer capacidadKg;

    @NotNull
    @Min(value = 0, message = "El porcentaje mínimo es 0.")
    @Max(value = 100, message = "El porcentaje máximo es 100.")
    private Integer porcentajeCarga;

    private LocalDate ultimoServicio;

    @NotNull(message = "Indica si el vehículo tiene auto gestión.")
    private Boolean autoGestion;
}
