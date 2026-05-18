package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.ActivoPatchRequest;
import com.promssac.backend.model.dto.request.WebUserCreateRequest;
import com.promssac.backend.model.dto.request.WebUserUpdateRequest;
import com.promssac.backend.model.dto.response.ResourceIdResponse;
import com.promssac.backend.model.dto.response.WebUserDetailResponse;
import com.promssac.backend.model.dto.response.WebUserListItemResponse;
import com.promssac.backend.service.UsuarioWebService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/usuarios-web")
@Validated
@RequiredArgsConstructor
public class UsuarioWebController {

    private final UsuarioWebService usuarioWebService;

    @GetMapping
    public ResponseEntity<List<WebUserListItemResponse>> listar(
            @RequestParam(name = "incluirInactivos", defaultValue = "false") boolean incluirInactivos) {
        return ResponseEntity.ok(usuarioWebService.listar(incluirInactivos));
    }

    @PostMapping
    public ResponseEntity<ResourceIdResponse> crear(@Valid @RequestBody WebUserCreateRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioWebService.crear(body));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebUserDetailResponse> detalle(@PathVariable UUID id) {
        return ResponseEntity.ok(usuarioWebService.obtenerDetalle(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceIdResponse> actualizar(
            @PathVariable UUID id, @Valid @RequestBody WebUserUpdateRequest body) {
        return ResponseEntity.ok(usuarioWebService.actualizar(id, body));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<Void> setActivo(@PathVariable UUID id, @Valid @RequestBody ActivoPatchRequest body) {
        usuarioWebService.setActivo(id, Boolean.TRUE.equals(body.getActivo()));
        return ResponseEntity.noContent().build();
    }
}
