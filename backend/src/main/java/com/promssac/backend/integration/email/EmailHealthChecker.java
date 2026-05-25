package com.promssac.backend.integration.email;

import com.resend.Resend;
import com.promssac.backend.config.ResendProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailHealthChecker {

    private final ResendProperties properties;

    private volatile boolean ultimoEstado = false;

    /**
     * Verifica que el token de Resend sea válido y el servicio esté accesible.
     */
    public boolean verificar() {
        if (!properties.isConfigured()) {
            ultimoEstado = false;
            return false;
        }
        try {
            new Resend(properties.getApiToken()).domains().list();
            ultimoEstado = true;
            log.debug("Resend health check: OK");
            return true;
        } catch (Exception e) {
            log.warn("Resend health check falló: {}", e.getMessage());
            ultimoEstado = false;
            return false;
        }
    }

    public boolean isActivo() {
        return ultimoEstado;
    }
}
