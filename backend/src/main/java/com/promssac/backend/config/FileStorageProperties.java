package com.promssac.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.storage")
public class FileStorageProperties {
    private String comentariosUploadDir = "data/comentarios";
    private String mobileUserPhotoDir = "data/usuarios-movil-fotos";
}
