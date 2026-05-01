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

    @Column(name = "cliente_nombre", length = 200)
    private String clienteNombre;

    @Column(name = "contacto_nombre", length = 120)
    private String contactoNombre;

    @Column(name = "contacto_identificador", length = 80)
    private String contactoIdentificador;

    @Column(name = "fecha_ruta", nullable = false)
    private LocalDate fechaRuta;

    @Column(name = "es_ultimo_despacho", nullable = false)
    private Boolean esUltimoDespacho = false;

    @Column(name = "creado_en", nullable = false)
    private Instant creadoEn = Instant.now();

    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn = Instant.now();
}
