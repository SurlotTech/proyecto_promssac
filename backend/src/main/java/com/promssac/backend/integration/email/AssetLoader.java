package com.promssac.backend.integration.email;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Carga assets estáticos desde el classpath y los cachea como base64.
 * Escalable: cualquier imagen, CSS, etc puede registrarse aquí.
 */
@Component
@Slf4j
public class AssetLoader {

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    private static final String ASSETS_BASE = "public/email/";

    @PostConstruct
    void precargar() {
        cargar("logo.png");
    }

    /**
     * Obtiene un asset como data URI base64. Si ya se cargó lo devuelve del caché.
     * Si falla la carga, retorna cadena vacía sin lanzar excepción.
     */
    public String dataUri(String filename) {
        return cache.computeIfAbsent(filename, this::cargarDesdeClasspath);
    }

    public byte[] bytes(String filename) {
        String b64 = dataUri(filename);
        if (!StringUtils.hasText(b64)) {
            return new byte[0];
        }
        String payload = b64.contains(",") ? b64.substring(b64.indexOf(",") + 1) : b64;
        return Base64.getDecoder().decode(payload);
    }

    private String cargar(String filename) {
        String uri = cargarDesdeClasspath(filename);
        if (StringUtils.hasText(uri)) {
            log.debug("Asset {} cargado", filename);
        }
        return uri;
    }

    private String cargarDesdeClasspath(String filename) {
        String path = ASSETS_BASE + filename;
        try {
            ClassPathResource resource = new ClassPathResource(path);
            byte[] bytes = resource.getInputStream().readAllBytes();
            String mime = detectarMime(filename);
            return "data:" + mime + ";base64," + Base64.getEncoder().encodeToString(bytes);
        } catch (IOException e) {
            log.warn("No se pudo cargar el asset {}: {}", path, e.getMessage());
            return "";
        }
    }

    private String detectarMime(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".css")) return "text/css";
        return "application/octet-stream";
    }
}
