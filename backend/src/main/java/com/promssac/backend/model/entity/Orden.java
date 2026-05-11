package com.promssac.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ordenes")
@Getter
@Setter
@NoArgsConstructor
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "numero_orden", nullable = false, unique = true, length = 64)
    private String numeroOrden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ruta_id")
    private Ruta ruta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    @Column(name = "vehiculo_placa", length = 32)
    private String vehiculoPlaca;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(length = 120)
    private String subestado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "contacto_nombre", length = 120)
    private String contactoNombre;

    @Column(name = "contacto_identificador", length = 80)
    private String contactoIdentificador;

    @Column(name = "contacto_telefono", length = 40)
    private String contactoTelefono;

    @Column(name = "contacto_email", length = 120)
    private String contactoEmail;

    /** Dirección de entrega (mapa / texto usuario). */
    @Column(name = "direccion_linea", columnDefinition = "TEXT")
    private String direccionLinea;

    @Column(name = "direccion_normalizada", columnDefinition = "TEXT")
    private String direccionNormalizada;

    @Column(name = "latitud", precision = 11, scale = 8)
    private BigDecimal latitud;

    @Column(name = "longitud", precision = 11, scale = 8)
    private BigDecimal longitud;

    @Column(name = "tiempo_servicio_minutos")
    private Integer tiempoServicioMinutos;

    @Column(name = "referencia_direccion", columnDefinition = "TEXT")
    private String referenciaDireccion;

    @Column(name = "ventana_entrega_desde", length = 16)
    private String ventanaEntregaDesde;

    @Column(name = "ventana_entrega_hasta", length = 16)
    private String ventanaEntregaHasta;

    @Column(name = "modo_entrega", length = 64)
    private String modoEntrega;

    @Column(name = "prioridad_entrega", length = 32)
    private String prioridadEntrega;

    @Column(name = "contra_entrega")
    private Boolean contraEntrega;

    /** JSON con campos personalizados (director, guías, etc.). */
    @Column(name = "campos_personalizados_json", columnDefinition = "TEXT")
    private String camposPersonalizadosJson;

    @Column(name = "fecha_ruta", nullable = false)
    private LocalDate fechaRuta;

    @Column(name = "es_ultimo_despacho", nullable = false)
    private Boolean esUltimoDespacho = false;

    @Column(name = "creado_en", nullable = false)
    private Instant creadoEn = Instant.now();

    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn = Instant.now();
}
