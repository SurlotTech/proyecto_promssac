package com.promssac.backend.service.impl;

import com.mailersend.sdk.MailerSend;
import com.mailersend.sdk.MailerSendResponse;
import com.mailersend.sdk.emails.Email;
import com.mailersend.sdk.exceptions.MailerSendException;
import com.promssac.backend.config.MailerSendProperties;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.integration.mailersend.EmailTemplateRenderer;
import com.promssac.backend.model.dto.request.NotificationSendRequest;
import com.promssac.backend.model.dto.response.NotificationSendResponse;
import com.promssac.backend.model.dto.response.NotificacionEnviadaListResponse;
import com.promssac.backend.model.entity.NotificacionEnviada;
import com.promssac.backend.repository.NotificacionEnviadaRepository;
import com.promssac.backend.repository.NotificacionEnviadaRepository.NotificacionEnviadaResumen;
import com.promssac.backend.service.MailerSendService;
import jakarta.annotation.PostConstruct;
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
public class MailerSendServiceImpl implements MailerSendService {

    private final MailerSendProperties properties;
    private final EmailTemplateRenderer templateRenderer;
    private final NotificacionEnviadaRepository notificacionRepo;
    private final TransactionTemplate transactionTemplate;

    @PostConstruct
    void configurarTransactionTemplate() {
        transactionTemplate.setPropagationBehavior(Propagation.REQUIRES_NEW.value());
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationSendResponse enviar(NotificationSendRequest request) {
        validarConfiguracion();
        Email email = armarEmail(request);
        email.addRecipient(
                StringUtils.hasText(request.getDestinatarioNombre()) ? request.getDestinatarioNombre() : "",
                request.getDestinatarioEmail());
        return despacharYRegistrar(email, request, request.getDestinatarioEmail());
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationSendResponse enviarATodos(NotificationSendRequest request, List<String> destinatarios) {
        validarConfiguracion();
        Email email = armarEmail(request);
        for (String dest : destinatarios) {
            email.addRecipient("", dest);
        }
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

    private Email armarEmail(NotificationSendRequest request) {
        if (!StringUtils.hasText(request.getContenidoPlano())
                && !StringUtils.hasText(request.getContenidoHtml())) {
            throw new BusinessException("Debe proporcionar contenido en texto plano o HTML.");
        }

        MailerSend ms = buildClient();
        Email email = ms.emails().createEmail();

        email.setFrom(properties.getFromName(), properties.getFromEmail());
        email.setSubject(request.getAsunto());

        if (StringUtils.hasText(request.getContenidoPlano())) {
            email.setPlain(request.getContenidoPlano());
        }
        if (StringUtils.hasText(request.getContenidoHtml())) {
            String html = templateRenderer.renderizarNotificacion(request.getContenidoHtml());
            email.setHtml(html);
        }

        return email;
    }

    private NotificationSendResponse despacharYRegistrar(Email email, NotificationSendRequest request, String receptorLog) {
        try {
            MailerSendResponse response = buildClient().emails().send(email);
            log.info("Email enviado a {} con messageId={}", receptorLog, response.messageId);
            persistir(request, response.messageId, "ENVIADO");
            return new NotificationSendResponse(response.messageId, "ENVIADO");
        } catch (MailerSendException e) {
            log.error("Error al enviar email a {}: {}", receptorLog, e.getMessage());
            persistir(request, null, "FALLIDO");
            throw new BusinessException("Error al enviar el email: " + e.getMessage());
        }
    }

    private void persistir(NotificationSendRequest request, String messageId, String estado) {
        // Usa REQUIRES_NEW para que el registro se confirme siempre,
        // incluso si la transaccion llamante se revierte (ej: error de envio)
        transactionTemplate.execute(status -> {
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
            return null;
        });
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

    private MailerSend buildClient() {
        MailerSend ms = new MailerSend();
        ms.setToken(properties.getApiToken());
        return ms;
    }

    private void validarConfiguracion() {
        if (!StringUtils.hasText(properties.getApiToken())) {
            throw new BusinessException("El token de MailerSend no esta configurado.");
        }
    }
}
