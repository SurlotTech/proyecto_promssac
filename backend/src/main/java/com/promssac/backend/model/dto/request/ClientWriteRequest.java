package com.promssac.backend.model.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClientWriteRequest {

    /**
     * Si viene vacío o ausente, el servidor arma el nombre como en la importación regional
     * (centro · IIEE · UGEL · código + nivel).
     */
    @Size(max = 200)
    private String nombre;

    @Size(max = 120)
    private String email;

    @Size(max = 40)
    private String telefono;

    @Size(max = 200)
    private String nombreApellidosDirectorIiee;

    @Size(max = 48)
    @JsonAlias("codigoArequipa")
    private String codigoRegional;

    @Size(max = 120)
    private String departamento;

    @Size(max = 120)
    private String provincia;

    @Size(max = 120)
    private String distrito;

    @Size(max = 220)
    private String ugel;

    @Size(max = 200)
    private String centroPoblado;

    @Size(max = 300)
    private String direccion;

    @Size(max = 48)
    private String codigoModularIiee;

    @Size(max = 80)
    private String nivelEducacion;

    /** Coordenadas del punto en mapa (WGS84). En PUT, si ambos son null y no se limpia, se conservan las guardadas. */
    private BigDecimal latitud;

    private BigDecimal longitud;

    /**
     * Si es {@code true} en PUT, borra coordenadas guardadas. Ignorado en creación (usar null en lat/long).
     */
    private Boolean ubicacionMapaLimpiar;

    /** {@code null} en POST = activar; en PUT {@code null} = no cambia el campo (solo si viene en JSON). */
    private Boolean activo;
}
