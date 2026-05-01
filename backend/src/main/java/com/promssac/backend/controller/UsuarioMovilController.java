package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.ActivoPatchRequest;
import com.promssac.backend.model.dto.request.MobileUserCreateRequest;
import com.promssac.backend.model.dto.request.MobileUserUpdateRequest;
import com.promssac.backend.model.dto.response.MobileUserDetailResponse;
import com.promssac.backend.model.dto.response.MobileUserListItemResponse;
import com.promssac.backend.model.dto.response.MobileUserPhotoPayload;
import com.promssac.backend.model.dto.response.MobileUserRouteOptionResponse;
import com.promssac.backend.model.dto.response.MobileUserResponse;
import com.promssac.backend.service.UsuarioMovilService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/usuarios-movil")
@Validated
@RequiredArgsConstructor
public class UsuarioMovilController {

    private final UsuarioMovilService usuarioMovilService;

    @GetMapping
    public ResponseEntity<List<MobileUserListItemResponse>> listar() {
        return ResponseEntity.ok(usuarioMovilService.listar());
    }

    /** Listado mínimo para combos de rutas (solo activos). Ruta con dos segmentos para no colisionar con {@code /{id}}. */
    @GetMapping("/opciones/ruta")
    public ResponseEntity<List<MobileUserRouteOptionResponse>> listarOpcionesParaRutas() {
        return ResponseEntity.ok(usuarioMovilService.listarOpcionesParaRutas());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MobileUserResponse> crear(
            @RequestPart("data") @Valid MobileUserCreateRequest data,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioMovilService.crear(data, foto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MobileUserDetailResponse> detalle(@PathVariable UUID id) {
        return ResponseEntity.ok(usuarioMovilService.obtenerDetalle(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MobileUserResponse> actualizar(
            @PathVariable UUID id,
            @RequestPart("data") @Valid MobileUserUpdateRequest data,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {
        return ResponseEntity.ok(usuarioMovilService.actualizar(id, data, foto));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<Void> setActivo(@PathVariable UUID id, @Valid @RequestBody ActivoPatchRequest body) {
        usuarioMovilService.setActivo(id, Boolean.TRUE.equals(body.getActivo()));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obtenerFoto(@PathVariable UUID id) {
        MobileUserPhotoPayload payload = usuarioMovilService.obtenerFoto(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, payload.contentType())
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(payload.data());
    }
}
