package com.promssac.backend.service;

import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    StoredFile storeComentario(MultipartFile archivo);

    StoredResource getComentario(String filename);

    String publicComentarioUrl(String reference);

    void storeUsuarioMovilPhoto(UUID usuarioMovilId, MultipartFile foto, String contentType);

    StoredResource getUsuarioMovilPhoto(UUID usuarioMovilId, String contentType);

    record StoredFile(String filename, String reference, String url) {
        public StoredFile(String filename, String url) {
            this(filename, url, url);
        }
    }

    record StoredResource(Resource resource, MediaType mediaType) {}
}
