package com.promssac.backend.service.impl;

import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.response.ComentarioResponse;
import com.promssac.backend.model.entity.ComentarioOrden;
import com.promssac.backend.model.entity.Orden;
import com.promssac.backend.repository.ComentarioOrdenRepository;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.security.CurrentUserProvider;
import com.promssac.backend.service.ComentarioService;
import com.promssac.backend.service.FileStorageService;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ComentarioServiceImpl implements ComentarioService {

    private static final DateTimeFormatter UI_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.ROOT);
    private static final ZoneId LIMA = ZoneId.of("America/Lima");

    private final ComentarioOrdenRepository comentarioRepository;
    private final OrdenRepository ordenRepository;
    private final FileStorageService fileStorageService;
    private final CurrentUserProvider currentUserProvider;

    @Override
    @Transactional(readOnly = true)
    public List<ComentarioResponse> listar(String numeroOrden) {
        String numero = normalizarNumeroOrden(numeroOrden);
        return comentarioRepository.findByOrdenNumeroOrdenOrderByCreadoEnAsc(numero)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ComentarioResponse agregar(String numeroOrden, String texto, MultipartFile archivo) {
        String numero = normalizarNumeroOrden(numeroOrden);
        Orden orden = ordenRepository.findByNumeroOrden(numero)
                .orElseThrow(() -> new ResourceNotFoundException("Orden", numero));

        ComentarioOrden comentario = new ComentarioOrden();
        comentario.setOrden(orden);
        comentario.setTexto(texto != null ? texto.trim() : "");
        comentario.setCreadoEn(Instant.now());
        comentario.setCreadoPor(currentUserProvider.currentUserNameOrSystem());

        if (archivo != null && !archivo.isEmpty()) {
            comentario.setArchivoUrl(fileStorageService.storeComentario(archivo).reference());
        }

        return toResponse(comentarioRepository.save(comentario));
    }

    private String normalizarNumeroOrden(String numeroOrden) {
        return numeroOrden == null ? "" : numeroOrden.trim();
    }

    private ComentarioResponse toResponse(ComentarioOrden comentario) {
        ComentarioResponse response = new ComentarioResponse();
        response.setId(comentario.getId().toString());
        response.setTexto(comentario.getTexto());
        response.setArchivoUrl(fileStorageService.publicComentarioUrl(comentario.getArchivoUrl()));
        response.setCreadoPor(comentario.getCreadoPor() != null ? comentario.getCreadoPor() : "");
        response.setCreadoEn(comentario.getCreadoEn().atZone(LIMA).format(UI_FORMAT));
        return response;
    }
}
