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
import java.time.LocalTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rutas")
@Getter
@Setter
@NoArgsConstructor
public class Ruta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 32)
    private String codigo;

    @Column(nullable = false, length = 200)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @Column(name = "conductor_movil", length = 120)
    private String conductorMovil;

    @Column(name = "fecha_entrega", nullable = false)
    private LocalDate fechaEntrega;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(nullable = false, length = 20)
    private String prioridad;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(length = 120)
    private String lugar;

    @Column(name = "despachos_completados", nullable = false)
    private Integer despachosCompletados = 0;

    @Column(name = "despachos_totales", nullable = false)
    private Integer despachosTotales = 0;

    @Column(name = "cobro_actual", nullable = false, precision = 14, scale = 2)
    private BigDecimal cobroActual = BigDecimal.ZERO;

    @Column(name = "cobro_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal cobroTotal = BigDecimal.ZERO;

    @Column(name = "monto_en_ruta", nullable = false, precision = 14, scale = 2)
    private BigDecimal montoEnRuta = BigDecimal.ZERO;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();
}
