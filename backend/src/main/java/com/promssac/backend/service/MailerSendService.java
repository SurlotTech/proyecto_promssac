package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.NotificationSendRequest;
import com.promssac.backend.model.dto.response.NotificationSendResponse;
import com.promssac.backend.model.dto.response.NotificacionEnviadaListResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MailerSendService {

    NotificationSendResponse enviar(NotificationSendRequest request);

    NotificationSendResponse enviarATodos(NotificationSendRequest request, List<String> destinatarios);

    Page<NotificacionEnviadaListResponse> listarEnviadas(Pageable pageable);

    NotificacionEnviadaListResponse obtenerPorId(String id);
}
