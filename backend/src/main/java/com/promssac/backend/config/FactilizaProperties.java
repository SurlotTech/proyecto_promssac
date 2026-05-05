package com.promssac.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "promssac.factiliza")
public class FactilizaProperties {

    /** Base URL de la API (sin barra final). */
    private String baseUrl = "https://api.factiliza.com/v1";

    /** Bearer token; configurar con PROMSSAC_FACTILIZA_TOKEN (no commitear). */
    private String apiToken = "";
}
