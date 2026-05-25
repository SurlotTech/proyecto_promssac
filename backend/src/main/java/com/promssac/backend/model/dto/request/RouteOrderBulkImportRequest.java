package com.promssac.backend.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RouteOrderBulkImportRequest {

    @NotEmpty
    @Valid
    private List<Item> items;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Item {

        @NotBlank @Size(max = 32)
        private String codigoRuta;

        @NotBlank @Size(max = 200)
        private String nombreRuta;

        @NotBlank @Size(max = 32)
        private String placaVehiculo;

        @NotNull
        private String fechaInicio;

        private String fechaFin;

        @NotBlank @Size(max = 64)
        private String numeroOrden;

        @Size(max = 30)
        private String estadoOrden;

        @Size(max = 120)
        private String subestado;

        @Size(max = 80)
        private String contactoIdentificador;

        @NotBlank @Size(max = 120)
        private String contactoNombre;

        @NotBlank @Size(max = 40)
        private String contactoTelefono;

        @Size(max = 120)
        private String contactoEmail;

        @Size(max = 30)
        private String nivel;

        @NotBlank @Size(max = 2000)
        private String direccion;

        @Size(max = 2000)
        private String direccionNormalizada;

        @Size(max = 16)
        private String fechaEntrega;

        @Size(max = 64)
        private String modoEntrega;

        @Size(max = 32)
        private String prioridadEntrega;

        @Size(max = 120)
        private String director;

        @Size(max = 40)
        private String telefonoDirector;

        @Size(max = 120)
        private String paquetes;

        @Size(max = 64)
        private String actaEntrega;

        @Size(max = 64)
        private String guiaRemision;

        @Size(max = 64)
        private String guiaTransportista;

        @Size(max = 120)
        private String correoElectronico;

        private String productoCodigo;
        private String productoNombre;
        private Integer productoCantidad;
        private BigDecimal productoPrecioUnit;
        private BigDecimal productoPesoKg;
        private String productoCampoExtra;
    }
}
