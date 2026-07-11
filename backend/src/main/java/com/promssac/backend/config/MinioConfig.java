package com.promssac.backend.config;

import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

@Configuration
@RequiredArgsConstructor
public class MinioConfig {

    private final MinioProperties properties;

    @Bean
    @Primary
    @ConditionalOnProperty(prefix = "promssac.minio", name = "enabled", havingValue = "true")
    public MinioClient minioClient() {
        if (!StringUtils.hasText(properties.getEndpoint())
                || !StringUtils.hasText(properties.getAccessKey())
                || !StringUtils.hasText(properties.getSecretKey())) {
            throw new IllegalStateException("MinIO esta habilitado pero faltan endpoint/accessKey/secretKey.");
        }
        return MinioClient.builder()
                .endpoint(properties.getEndpoint())
                .credentials(properties.getAccessKey(), properties.getSecretKey())
                .build();
    }

    @Bean("minioPublicClient")
    @ConditionalOnProperty(prefix = "promssac.minio", name = "enabled", havingValue = "true")
    public MinioClient minioPublicClient() {
        String endpoint = StringUtils.hasText(properties.getPublicEndpoint())
                ? properties.getPublicEndpoint()
                : properties.getEndpoint();
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(properties.getAccessKey(), properties.getSecretKey())
                .build();
    }
}
