package com.promssac.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "alertas_config")
@Getter
@Setter
@NoArgsConstructor
public class AlertaConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "alerta_entregado", nullable = false)
    private Boolean alertaEntregado = true;

    @Column(name = "alerta_demora", nullable = false)
    private Boolean alertaDemora = true;

    @Column(name = "demora_minutos", nullable = false)
    private Integer demoraMinutos = 20;

    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn = Instant.now();
}
