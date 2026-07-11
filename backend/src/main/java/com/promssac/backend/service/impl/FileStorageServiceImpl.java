package com.promssac.backend.service.impl;

import com.promssac.backend.config.FileStorageProperties;
import com.promssac.backend.config.MinioProperties;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.service.FileStorageService;
import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import java.io.InputStream;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    private final MinioProperties minioProperties;
    private final FileStorageProperties fileStorageProperties;
    private final ObjectProvider<MinioClient> minioClientProvider;
    private final ObjectProvider<MinioClient> minioPublicClientProvider;

    public FileStorageServiceImpl(
            MinioProperties minioProperties,
            FileStorageProperties fileStorageProperties,
            ObjectProvider<MinioClient> minioClientProvider,
            @Qualifier("minioPublicClient") ObjectProvider<MinioClient> minioPublicClientProvider) {
        this.minioProperties = minioProperties;
        this.fileStorageProperties = fileStorageProperties;
        this.minioClientProvider = minioClientProvider;
        this.minioPublicClientProvider = minioPublicClientProvider;
    }

    @Override
    public StoredFile storeComentario(MultipartFile archivo) {
        String filename = buildFilename(archivo.getOriginalFilename());
        if (minioProperties.isEnabled()) {
            String objectKey = objectName(filename);
            storeComentarioInMinio(objectKey, filename, archivo);
            return new StoredFile(filename, objectKey, publicComentarioUrl(objectKey));
        } else {
            storeComentarioLocally(filename, archivo);
            String url = "/api/v1/files/comentarios/" + urlEncode(filename);
            return new StoredFile(filename, url, url);
        }
    }

    @Override
    public StoredResource getComentario(String filename) {
        if (minioProperties.isEnabled()) {
            return getComentarioFromMinio(normalizeObjectReference(filename));
        }
        String safeFilename = sanitizeFilename(filename);
        return getComentarioLocally(safeFilename);
    }

    @Override
    public String publicComentarioUrl(String reference) {
        if (!StringUtils.hasText(reference) || !minioProperties.isEnabled()) {
            return reference;
        }
        if (reference.startsWith("http://") || reference.startsWith("https://")) {
            return reference;
        }
        try {
            return minioPublicClient().getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(minioProperties.getBucket())
                    .object(normalizeObjectReference(reference))
                    .expiry(minioProperties.getPresignGetMinutes(), TimeUnit.MINUTES)
                    .build());
        } catch (Exception e) {
            log.warn("No se pudo generar URL presignada MinIO bucket={} reference={}",
                    minioProperties.getBucket(), reference, e);
            return reference;
        }
    }

    private void storeComentarioInMinio(String objectKey, String filename, MultipartFile archivo) {
        try {
            MinioClient minioClient = minioClient();
            try (InputStream input = archivo.getInputStream()) {
                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(minioProperties.getBucket())
                        .object(objectKey)
                        .stream(input, archivo.getSize(), -1)
                        .contentType(contentType(archivo))
                        .build());
            }
        } catch (Exception e) {
            log.error("No se pudo subir evidencia a MinIO bucket={} filename={}",
                    minioProperties.getBucket(), filename, e);
            throw new BusinessException("No se pudo guardar el archivo adjunto.");
        }
    }

    private StoredResource getComentarioFromMinio(String objectKey) {
        try {
            InputStream input = minioClient().getObject(GetObjectArgs.builder()
                    .bucket(minioProperties.getBucket())
                    .object(objectKey)
                    .build());
            return new StoredResource(new InputStreamResource(input), MediaType.APPLICATION_OCTET_STREAM);
        } catch (Exception e) {
            log.warn("No se pudo leer evidencia desde MinIO bucket={} objectKey={}",
                    minioProperties.getBucket(), objectKey, e);
            return null;
        }
    }

    private void storeComentarioLocally(String filename, MultipartFile archivo) {
        try {
            Path dir = Paths.get(fileStorageProperties.getComentariosUploadDir());
            Files.createDirectories(dir);
            archivo.transferTo(dir.resolve(filename));
        } catch (Exception e) {
            throw new BusinessException("No se pudo guardar el archivo adjunto.", e);
        }
    }

    private StoredResource getComentarioLocally(String filename) {
        try {
            Path base = Paths.get(fileStorageProperties.getComentariosUploadDir()).toAbsolutePath().normalize();
            Path file = base.resolve(filename).normalize();
            if (!file.startsWith(base) || !Files.exists(file)) {
                return null;
            }
            Resource resource = new UrlResource(file.toUri());
            String contentType = Files.probeContentType(file);
            return new StoredResource(
                    resource,
                    contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM);
        } catch (Exception e) {
            return null;
        }
    }

    private MinioClient minioClient() {
        MinioClient client = minioClientProvider.getIfAvailable();
        if (client == null) {
            throw new BusinessException("MinIO esta habilitado pero no hay cliente configurado.");
        }
        return client;
    }

    private MinioClient minioPublicClient() {
        MinioClient client = minioPublicClientProvider.getIfAvailable();
        return client != null ? client : minioClient();
    }

    private String objectName(String filename) {
        String prefix = minioProperties.getComentariosPrefix();
        if (!StringUtils.hasText(prefix)) {
            return filename;
        }
        return prefix.replaceAll("^/+|/+$", "") + "/" + filename;
    }

    private String normalizeObjectReference(String reference) {
        String cleanReference = reference.trim();
        String legacyPrefix = "/api/v1/files/comentarios/";
        if (cleanReference.startsWith(legacyPrefix)) {
            String encodedFilename = cleanReference.substring(legacyPrefix.length());
            return objectName(sanitizeFilename(URLDecoder.decode(encodedFilename, StandardCharsets.UTF_8)));
        }
        String prefix = minioProperties.getComentariosPrefix();
        String normalizedPrefix = StringUtils.hasText(prefix) ? prefix.replaceAll("^/+|/+$", "") + "/" : "";
        if (StringUtils.hasText(normalizedPrefix) && cleanReference.startsWith(normalizedPrefix)) {
            return cleanReference;
        }
        if (cleanReference.contains("/")) {
            return cleanReference.replaceAll("^/+", "");
        }
        return objectName(sanitizeFilename(cleanReference));
    }

    private static String buildFilename(String originalFilename) {
        return UUID.randomUUID() + "_" + sanitizeFilename(originalFilename);
    }

    private static String sanitizeFilename(String filename) {
        String raw = StringUtils.hasText(filename) ? filename : "archivo";
        String clean = Paths.get(raw).getFileName().toString();
        return clean.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    private static String contentType(MultipartFile archivo) {
        return StringUtils.hasText(archivo.getContentType())
                ? archivo.getContentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }

    private static String urlEncode(String filename) {
        return URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
