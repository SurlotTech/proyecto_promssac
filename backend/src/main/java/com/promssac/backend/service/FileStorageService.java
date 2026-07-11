package com.promssac.backend.service;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    StoredFile storeComentario(MultipartFile archivo);

    StoredResource getComentario(String filename);

    String publicComentarioUrl(String reference);

    record StoredFile(String filename, String reference, String url) {
        public StoredFile(String filename, String url) {
            this(filename, url, url);
        }
    }

    record StoredResource(Resource resource, MediaType mediaType) {}
}
