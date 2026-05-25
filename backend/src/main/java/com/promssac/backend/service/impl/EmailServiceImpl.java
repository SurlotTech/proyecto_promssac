package com.promssac.backend.service.impl;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import com.promssac.backend.config.ResendProperties;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.integration.email.EmailTemplateRenderer;
import com.promssac.backend.model.dto.request.NotificationSendRequest;
import com.promssac.backend.model.dto.response.NotificationSendResponse;
import com.promssac.backend.model.dto.response.NotificacionEnviadaListResponse;
import com.promssac.backend.model.entity.NotificacionEnviada;
import com.promssac.backend.repository.NotificacionEnviadaRepository;
import com.promssac.backend.repository.NotificacionEnviadaRepository.NotificacionEnviadaResumen;
import com.promssac.backend.service.EmailService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private static final String ESTADO_ENVIADO = "Enviado";
    private static final String ESTADO_FALLIDO = "Fallido";

    private final ResendProperties properties;
    private final EmailTemplateRenderer templateRenderer;
    private final NotificacionEnviadaRepository notificacionRepo;
    private final TransactionTemplate transactionTemplate;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationSendResponse enviar(NotificationSendRequest request) {
        return enviarATodos(request, List.of(request.getDestinatarioEmail()));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationSendResponse enviarATodos(NotificationSendRequest request, List<String> destinatarios) {
        validarConfiguracion();
        CreateEmailOptions email = armarEmail(request, destinatarios);
        String receptorLog = String.join(", ", destinatarios);
        return despacharYRegistrar(email, request, receptorLog);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificacionEnviadaListResponse> listarEnviadas(Pageable pageable) {
        return notificacionRepo.findAllByOrderByEnviadoEnDesc(pageable)
                .map(this::toListResponseFromResumen);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificacionEnviadaListResponse obtenerPorId(String id) {
        NotificacionEnviada entity = notificacionRepo.findById(UUID.fromString(id))
                .orElseThrow(() -> new ResourceNotFoundException("Notificacion", id));
        return toListResponse(entity);
    }

    private void validarConfiguracion() {
        if (!properties.isConfigured()) {
            throw new BusinessException("El token de Resend no esta configurado.");
        }
    }

    private CreateEmailOptions armarEmail(NotificationSendRequest request, List<String> destinatarios) {
        if (!StringUtils.hasText(request.getContenidoPlano())
                && !StringUtils.hasText(request.getContenidoHtml())) {
            throw new BusinessException("Debe proporcionar contenido en texto plano o HTML.");
        }

        CreateEmailOptions.Builder builder = CreateEmailOptions.builder()
                .from(properties.getFrom())
                .subject(request.getAsunto())
                .to(destinatarios);

        if (StringUtils.hasText(request.getContenidoPlano())) {
            builder.text(request.getContenidoPlano());
        }
        if (StringUtils.hasText(request.getContenidoHtml())) {
            String html = templateRenderer.renderizarNotificacion(request.getContenidoHtml());
            builder.html(html);
        }

        return builder.build();
    }

    private NotificationSendResponse despacharYRegistrar(CreateEmailOptions email, NotificationSendRequest request, String receptorLog) {
        try {
            CreateEmailResponse response = new Resend(properties.getApiToken()).emails().send(email);
            log.info("Email enviado a {} con messageId={}", receptorLog, response.getId());
            persistir(request, response.getId(), ESTADO_ENVIADO);
            return new NotificationSendResponse(response.getId(), ESTADO_ENVIADO);
        } catch (ResendException e) {
            log.error("Error al enviar email a {}: {}", receptorLog, e.getMessage());
            persistir(request, null, ESTADO_FALLIDO);
            throw new BusinessException("Error al enviar el email: " + e.getMessage());
        }
    }

    private void persistir(NotificationSendRequest request, String messageId, String estado) {
        transactionTemplate.executeWithoutResult(status -> {
            NotificacionEnviada notif = new NotificacionEnviada();
            notif.setDestinatarioEmail(request.getDestinatarioEmail());
            notif.setDestinatarioNombre(request.getDestinatarioNombre());
            notif.setAsunto(request.getAsunto());
            notif.setContenido(StringUtils.hasText(request.getContenidoHtml())
                    ? request.getContenidoHtml()
                    : request.getContenidoPlano());
            notif.setMessageId(messageId);
            notif.setEstado(estado);
            notif.setTipo(request.getTipo());
            notif.setOrdenCodigo(request.getOrdenCodigo());
            notificacionRepo.save(notif);
        });
    }

    private NotificacionEnviadaListResponse toListResponseFromResumen(NotificacionEnviadaResumen r) {
        return NotificacionEnviadaListResponse.builder()
                .id(r.getId().toString())
                .destinatarioEmail(r.getDestinatarioEmail())
                .destinatarioNombre(r.getDestinatarioNombre())
                .asunto(r.getAsunto())
                .messageId(r.getMessageId())
                .estado(r.getEstado())
                .tipo(r.getTipo())
                .ordenCodigo(r.getOrdenCodigo())
                .enviadoEn(r.getEnviadoEn())
                .build();
    }

    private NotificacionEnviadaListResponse toListResponse(NotificacionEnviada entity) {
        return NotificacionEnviadaListResponse.builder()
                .id(entity.getId().toString())
                .destinatarioEmail(entity.getDestinatarioEmail())
                .destinatarioNombre(entity.getDestinatarioNombre())
                .asunto(entity.getAsunto())
                .contenido(entity.getContenido())
                .messageId(entity.getMessageId())
                .estado(entity.getEstado())
                .tipo(entity.getTipo())
                .ordenCodigo(entity.getOrdenCodigo())
                .enviadoEn(entity.getEnviadoEn())
                .build();
    }
}
