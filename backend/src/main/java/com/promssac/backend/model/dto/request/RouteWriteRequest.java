package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RouteWriteRequest {

    @Size(max = 32)
    private String codigo;

    @NotBlank
    @Size(max = 200)
    private String nombre;

    @NotNull
    private UUID vehiculoId;

    private UUID usuarioMovilId;

    @NotNull
    private LocalDate fechaEntrega;

    @NotNull
    private LocalTime horaInicio;

    private LocalTime horaFin;

    @Size(max = 20)
    private String prioridad;

    @Size(max = 30)
    private String estado;

    @Size(max = 120)
    private String lugar;

    private Integer despachosCompletados;

    private Integer despachosTotales;

    private BigDecimal cobroActual;

    private BigDecimal cobroTotal;

    private BigDecimal montoEnRuta;
}
