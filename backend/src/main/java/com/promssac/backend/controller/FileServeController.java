package com.promssac.backend.controller;

import com.promssac.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileServeController {

    private final FileStorageService fileStorageService;

    @GetMapping("/comentarios/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        FileStorageService.StoredResource stored = fileStorageService.getComentario(filename);
        if (stored == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(stored.mediaType())
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(stored.resource());
    }
}
