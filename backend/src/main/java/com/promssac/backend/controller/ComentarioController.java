package com.promssac.backend.controller;

import com.promssac.backend.model.dto.response.ComentarioResponse;
import com.promssac.backend.model.entity.ComentarioOrden;
import com.promssac.backend.model.entity.Orden;
import com.promssac.backend.repository.ComentarioOrdenRepository;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.security.WebUserDetails;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ordenes/{numeroOrden}/comentarios")
@RequiredArgsConstructor
public class ComentarioController {

    private static final DateTimeFormatter UI_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.ROOT);
    private static final ZoneId LIMA = ZoneId.of("America/Lima");

    private final ComentarioOrdenRepository repository;
    private final OrdenRepository ordenRepository;

    @Value("${app.comentarios-upload-dir:data/comentarios}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<List<ComentarioResponse>> listar(@PathVariable String numeroOrden) {
        return ResponseEntity.ok(
                repository.findByOrdenNumeroOrdenOrderByCreadoEnAsc(numeroOrden.trim())
                        .stream().map(this::toResponse).toList());
    }

    @PostMapping
    public ResponseEntity<ComentarioResponse> agregar(
            @PathVariable String numeroOrden,
            @RequestParam("texto") String texto,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo) throws IOException {

        Orden orden = ordenRepository.findByNumeroOrden(numeroOrden.trim())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Orden no encontrada"));

        ComentarioOrden c = new ComentarioOrden();
        c.setOrden(orden);
        c.setTexto(texto.trim());
        c.setCreadoEn(Instant.now());

        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof WebUserDetails user) {
            c.setCreadoPor(user.getNombreCompleto());
        } else {
            c.setCreadoPor("Sistema");
        }

        if (archivo != null && !archivo.isEmpty()) {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
            Path target = dir.resolve(filename);
            archivo.transferTo(target);
            c.setArchivoUrl("/api/v1/files/comentarios/" + filename);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(repository.save(c)));
    }

    private ComentarioResponse toResponse(ComentarioOrden c) {
        ComentarioResponse r = new ComentarioResponse();
        r.setId(c.getId().toString());
        r.setTexto(c.getTexto());
        r.setArchivoUrl(c.getArchivoUrl());
        r.setCreadoPor(c.getCreadoPor() != null ? c.getCreadoPor() : "");
        r.setCreadoEn(c.getCreadoEn().atZone(LIMA).format(UI_FORMAT));
        return r;
    }
}
