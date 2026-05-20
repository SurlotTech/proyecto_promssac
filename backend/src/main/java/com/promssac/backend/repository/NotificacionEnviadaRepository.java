package com.promssac.backend.repository;

import com.promssac.backend.model.entity.NotificacionEnviada;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacionEnviadaRepository extends JpaRepository<NotificacionEnviada, UUID> {

    /** Proyección sin el TEXT contenido para consultas de listado rápidas. */
    Page<NotificacionEnviadaResumen> findAllByOrderByEnviadoEnDesc(Pageable pageable);

    List<NotificacionEnviada> findByDestinatarioEmailIgnoreCaseOrderByEnviadoEnDesc(String email);

    List<NotificacionEnviada> findByOrdenCodigoOrderByEnviadoEnDesc(String ordenCodigo);

    interface NotificacionEnviadaResumen {
        UUID getId();
        String getDestinatarioEmail();
        String getDestinatarioNombre();
        String getAsunto();
        String getMessageId();
        String getEstado();
        String getTipo();
        String getOrdenCodigo();
        Instant getEnviadoEn();
    }
}
