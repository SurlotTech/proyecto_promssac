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
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "dispositivos_flota")
@Getter
@Setter
@NoArgsConstructor
public class DispositivoFlota {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @Column(nullable = false, unique = true, length = 32)
    private String imei;

    @Column(name = "ultimo_lat")
    private Double ultimoLat;

    @Column(name = "ultimo_lng")
    private Double ultimoLng;

    @Column(nullable = false, length = 20)
    private String estado;

    @Column(name = "bateria_pct")
    private Integer bateriaPct;

    @Column(name = "barras_senal")
    private Integer barrasSenal;

    @Column(name = "ultimo_visto")
    private Instant ultimoVisto;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();
}
