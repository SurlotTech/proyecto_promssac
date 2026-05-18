package com.promssac.backend.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/files")
public class FileServeController {

    @Value("${app.comentarios-upload-dir:data/comentarios}")
    private String uploadDir;

    @GetMapping("/comentarios/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path file = Paths.get(uploadDir).resolve(filename).normalize();
            if (!Files.exists(file)) return ResponseEntity.notFound().build();
            Resource resource = new UrlResource(file.toUri());
            String contentType = Files.probeContentType(file);
            return ResponseEntity.ok()
                    .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
