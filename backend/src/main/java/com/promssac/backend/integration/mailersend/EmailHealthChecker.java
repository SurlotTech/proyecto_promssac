package com.promssac.backend.integration.mailersend;

import com.mailersend.sdk.MailerSend;
import com.promssac.backend.config.MailerSendProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailHealthChecker {

    private final MailerSendProperties properties;

    private volatile boolean ultimoEstado = false;

    /**
     * Verifica que el token de MailerSend sea válido y el servicio esté accesible.
     */
    public boolean verificar() {
        if (!StringUtils.hasText(properties.getApiToken())) {
            ultimoEstado = false;
            return false;
        }
        try {
            MailerSend ms = new MailerSend();
            ms.setToken(properties.getApiToken());
            ms.domains().getDomains();
            ultimoEstado = true;
            log.debug("MailerSend health check: OK");
            return true;
        } catch (Exception e) {
            log.warn("MailerSend health check falló: {}", e.getMessage());
            ultimoEstado = false;
            return false;
        }
    }

    public boolean isActivo() {
        return ultimoEstado;
    }
}
