package com.promssac.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "promssac.mailersend")
public class MailerSendProperties {

    private String apiToken = "";

    /** Nombre del remitente que aparece en los correos. */
    private String fromName = "PROMSSAC";

    /** Email verificado del remitente en MailerSend. */
    private String fromEmail = "info@promssac.com";
}
