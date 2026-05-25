package com.promssac.backend.model.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EnlaceResponse {

    private String numeroOrden;
    private String estado;
    private String nombreCliente;
    private String contactoNombre;
    private String contactoTelefono;
    private String contactoEmail;
    private String direccionLinea;
    private Double latitud;
    private Double longitud;
    private String fechaRuta;
    private String creadoEn;
    private String conductorNombre;
    private String conductorTelefono;
    private List<HistorialEntry> historial;

    @Getter
    @Builder
    public static class HistorialEntry {
        private String estado;
        private String fecha;
    }
}
