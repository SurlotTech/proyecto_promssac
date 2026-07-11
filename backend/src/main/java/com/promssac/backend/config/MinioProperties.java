package com.promssac.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "promssac.minio")
public class MinioProperties {
    private boolean enabled = false;
    private String endpoint;
    private String publicEndpoint;
    private String accessKey;
    private String secretKey;
    private String bucket = "promssac-evidencias";
    private String comentariosPrefix = "comentarios";
    private String usuariosMovilPrefix = "usuarios-movil";
    private int presignGetMinutes = 120;
}
