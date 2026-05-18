package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.ActivoPatchRequest;
import com.promssac.backend.model.dto.request.SubestadoWriteRequest;
import com.promssac.backend.model.dto.response.SubestadoResponse;
import com.promssac.backend.service.SubestadoService;
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
@RequestMapping("/api/v1/subestados")
@Validated
@RequiredArgsConstructor
public class SubestadoController {

    private final SubestadoService subestadoService;

    @GetMapping
    public ResponseEntity<List<SubestadoResponse>> listar(
            @RequestParam(name = "incluirInactivos", defaultValue = "false") boolean incluirInactivos) {
        return ResponseEntity.ok(subestadoService.listar(incluirInactivos));
    }

    @GetMapping("/por-estado")
    public ResponseEntity<List<SubestadoResponse>> listarPorEstado(
            @RequestParam(name = "estado") String estadoPadre) {
        return ResponseEntity.ok(subestadoService.listarPorEstadoPadre(estadoPadre));
    }

    @PostMapping
    public ResponseEntity<SubestadoResponse> crear(@Valid @RequestBody SubestadoWriteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subestadoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubestadoResponse> actualizar(
            @PathVariable UUID id, @Valid @RequestBody SubestadoWriteRequest request) {
        return ResponseEntity.ok(subestadoService.actualizar(id, request));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<Void> setActivo(@PathVariable UUID id, @Valid @RequestBody ActivoPatchRequest body) {
        subestadoService.setActivo(id, Boolean.TRUE.equals(body.getActivo()));
        return ResponseEntity.noContent().build();
    }
}
