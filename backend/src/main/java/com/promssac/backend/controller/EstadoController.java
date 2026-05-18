package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.ActivoPatchRequest;
import com.promssac.backend.model.dto.request.EstadoWriteRequest;
import com.promssac.backend.model.dto.response.EstadoResponse;
import com.promssac.backend.service.EstadoService;
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
@RequestMapping("/api/v1/estados")
@Validated
@RequiredArgsConstructor
public class EstadoController {

    private final EstadoService estadoService;

    @GetMapping("/padres")
    public ResponseEntity<List<EstadoResponse>> listarPadres(
            @RequestParam(name = "incluirInactivos", defaultValue = "false") boolean incluirInactivos) {
        return ResponseEntity.ok(estadoService.listarPadres(incluirInactivos));
    }

    @GetMapping("/{id}/hijos")
    public ResponseEntity<List<EstadoResponse>> listarHijos(
            @PathVariable UUID id,
            @RequestParam(name = "incluirInactivos", defaultValue = "false") boolean incluirInactivos) {
        return ResponseEntity.ok(estadoService.listarHijos(id, incluirInactivos));
    }

    @GetMapping("/hijos/por-padre")
    public ResponseEntity<List<EstadoResponse>> listarHijosPorNombrePadre(
            @RequestParam(name = "nombre") String nombrePadre) {
        return ResponseEntity.ok(estadoService.listarHijosPorClavePadre(nombrePadre));
    }

    @PostMapping
    public ResponseEntity<EstadoResponse> crear(@Valid @RequestBody EstadoWriteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(estadoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstadoResponse> actualizar(
            @PathVariable UUID id, @Valid @RequestBody EstadoWriteRequest request) {
        return ResponseEntity.ok(estadoService.actualizar(id, request));
    }

    @PatchMapping("/{id}/activo")
    public ResponseEntity<Void> setActivo(@PathVariable UUID id, @Valid @RequestBody ActivoPatchRequest body) {
        estadoService.setActivo(id, Boolean.TRUE.equals(body.getActivo()));
        return ResponseEntity.noContent().build();
    }
}
