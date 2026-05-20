package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderCreateRequest {

    @NotBlank
    @Size(max = 64)
    private String numeroOrden;

    /** Opcional: si no se envía, se deriva de la ruta asignada. */
    private LocalDate fechaRuta;

    private UUID rutaId;

    private UUID vehiculoId;

    @Size(max = 30)
    private String estado;

    @Size(max = 120)
    private String subestado;

    private UUID clienteId;

    @Size(max = 120)
    private String contactoNombre;

    @Size(max = 80)
    private String contactoIdentificador;

    private Boolean esUltimoDespacho;
}
