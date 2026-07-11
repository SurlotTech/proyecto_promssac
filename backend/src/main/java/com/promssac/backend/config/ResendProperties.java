package com.promssac.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "promssac.resend")
public class ResendProperties {

    private String apiToken = "";

    /** Nombre del remitente que aparece en los correos. */
    private String fromName = "SUTRACK";

    /** Email verificado del remitente en Resend. */
    private String fromEmail = "rutas.promssac@gmail.com";

    /** URL base del frontend para generar links de seguimiento en los correos. */
    private String frontendUrl = "http://localhost:5173";

    /** Retorna el remitente en formato "Nombre <email>" requerido por Resend. */
    public String getFrom() {
        return fromName + " <" + fromEmail + ">";
    }

    public boolean isConfigured() {
        return apiToken != null && !apiToken.isBlank();
    }
}
