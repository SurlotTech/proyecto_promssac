package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Datos adicionales del asistente &quot;Completar orden&quot; (contacto ampliado, dirección, ventana, extras).
 */
@Getter
@Setter
@NoArgsConstructor
public class OrderCompleteRequest {

    @NotBlank
    @Size(max = 64)
    private String numeroOrden;

    @Size(max = 120)
    private String contactoNombre;

    @Size(max = 80)
    private String contactoIdentificador;

    /** Celular Perú: exactamente 9 dígitos. */
    @NotBlank(message = "Teléfono obligatorio.")
    @Pattern(regexp = "\\d{9}", message = "El teléfono debe tener exactamente 9 dígitos.")
    private String contactoTelefono;

    @Size(max = 120)
    private String contactoEmail;

    /** Dirección mostrada / editable (mapa o búsqueda). */
    @Size(max = 2000)
    private String direccionLinea;

    /** Dirección normalizada (p. ej. Nominatim). */
    @Size(max = 2000)
    private String direccionNormalizada;

    private BigDecimal latitud;

    private BigDecimal longitud;

    private Integer tiempoServicioMinutos;

    @Size(max = 2000)
    private String referenciaDireccion;

    /** Ventana de entrega (texto libre, ej. HH:mm). */
    @Size(max = 16)
    private String ventanaEntregaDesde;

    @Size(max = 16)
    private String ventanaEntregaHasta;

    @Size(max = 64)
    private String modoEntrega;

    @Size(max = 32)
    private String prioridadEntrega;

    private Boolean contraEntrega;

    /** Claves acordadas con el frontend (director, cajas, guías). */
    private Map<String, String> camposPersonalizados;

    /** Asignar o cambiar el vehículo (placa se denormaliza en la orden). */
    private UUID vehiculoId;

    /** Si es true, quita vehículo y placa de la orden. */
    private Boolean quitarVehiculo;
}
