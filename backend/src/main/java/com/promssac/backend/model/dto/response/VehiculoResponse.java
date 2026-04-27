package com.promssac.backend.model.dto.response;

import com.promssac.backend.model.enums.EstadoVehiculo;
import com.promssac.backend.model.enums.TipoVehiculo;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoResponse {

    private UUID id;
    private String placa;
    private TipoVehiculo tipo;
    private String grupo;
    private String conductor;
    private EstadoVehiculo estado;
    private Integer capacidadKg;
    private Integer porcentajeCarga;
    private LocalDate ultimoServicio;
    private Boolean autoGestion;
    private LocalDateTime creadoEn;
}
