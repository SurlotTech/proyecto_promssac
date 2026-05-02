package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.ActivoPatchRequest;
import com.promssac.backend.model.dto.request.RolWebCreateRequest;
import com.promssac.backend.model.dto.request.RolWebUpdateRequest;
import com.promssac.backend.model.dto.response.ResourceIdResponse;
import com.promssac.backend.model.dto.response.RolWebDetailResponse;
import com.promssac.backend.model.dto.response.RolWebListItemResponse;
import com.promssac.backend.model.dto.response.RolWebOpcionResponse;
import com.promssac.backend.service.RolWebService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/roles-web")
@Validated
@RequiredArgsConstructor
public class RolWebController {

    private final RolWebService rolWebService;

    @GetMapping
    public ResponseEntity<List<RolWebListItemResponse>> listar() {
        return ResponseEntity.ok(rolWebService.listar());
    }

    @GetMapping("/opciones")
    public ResponseEntity<List<RolWebOpcionResponse>> listarOpciones() {
        return ResponseEntity.ok(rolWebService.listarOpcionesActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RolWebDetailResponse> detalle(@PathVariable UUID id) {
        return ResponseEntity.ok(rolWebService.obtenerDetalle(id));
    }

    @PostMapping
    public ResponseEntity<ResourceIdResponse> crear(@Valid @RequestBody RolWebCreateRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rolWebService.crear(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceIdResponse> actualizar(
            @PathVariable UUID id, @Valid @RequestBody RolWebUpdateRequest body) {
        return ResponseEntity.ok(rolWebService.actualizar(id, body));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<Void> setActivo(@PathVariable UUID id, @Valid @RequestBody ActivoPatchRequest body) {
        rolWebService.setActivo(id, Boolean.TRUE.equals(body.getActivo()));
        return ResponseEntity.noContent().build();
    }
}
