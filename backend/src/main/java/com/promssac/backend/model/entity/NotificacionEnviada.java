package com.promssac.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notificaciones_enviadas", indexes = {
    @Index(name = "idx_notif_enviadas_enviado_en", columnList = "enviado_en DESC"),
    @Index(name = "idx_notif_enviadas_dest_email", columnList = "destinatario_email"),
    @Index(name = "idx_notif_enviadas_orden_cod", columnList = "orden_codigo"),
    @Index(name = "idx_notif_enviadas_estado", columnList = "estado")
})
@Getter
@Setter
@NoArgsConstructor
public class NotificacionEnviada {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "destinatario_email", nullable = false, length = 255)
    private String destinatarioEmail;

    @Column(name = "destinatario_nombre", length = 200)
    private String destinatarioNombre;

    @Column(nullable = false, length = 255)
    private String asunto;

    @Column(name = "contenido", columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "message_id", length = 100)
    private String messageId;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(name = "tipo", length = 64)
    private String tipo;

    @Column(name = "orden_codigo", length = 64)
    private String ordenCodigo;

    @Column(name = "enviado_en", nullable = false)
    private Instant enviadoEn = Instant.now();
}
