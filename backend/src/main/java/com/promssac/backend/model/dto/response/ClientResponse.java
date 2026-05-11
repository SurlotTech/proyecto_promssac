package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClientResponse {

    private String id;

    /** Nombre fiscal o nombre comercial visible en operaciones. */
    private String nombre;

    private String email;
    private String telefono;
    private String nombreApellidosDirectorIiee;

    private String codigoRegional;
    private String departamento;
    private String provincia;
    private String distrito;
    private String ugel;
    private String centroPoblado;
    private String direccion;

    private Double latitud;
    private Double longitud;

    private String codigoModularIiee;
    private String nivelEducacion;

    /** Usuario puede operar sobre el registro cuando es {@code true}. */
    private Boolean activo;
    /** Órdenes con {@code ordenes.cliente_id} apuntando a este cliente. */
    private long ordenesTotalesRelacionadas;
}
