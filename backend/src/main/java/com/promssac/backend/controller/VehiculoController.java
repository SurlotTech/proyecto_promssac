package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.VehicleWriteRequest;
import com.promssac.backend.model.dto.response.VehicleOptionResponse;
import com.promssac.backend.model.dto.response.VehicleResponse;
import com.promssac.backend.service.VehiculoService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vehiculos")
@Validated
@RequiredArgsConstructor
public class VehiculoController {

    private final VehiculoService vehiculoService;

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> listar() {
        return ResponseEntity.ok(vehiculoService.listar());
    }

    @GetMapping("/opciones")
    public ResponseEntity<List<VehicleOptionResponse>> listarOpciones() {
        return ResponseEntity.ok(vehiculoService.listarOpciones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(vehiculoService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> crear(@Valid @RequestBody VehicleWriteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> actualizar(@PathVariable UUID id,
                                                    @Valid @RequestBody VehicleWriteRequest request) {
        return ResponseEntity.ok(vehiculoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        vehiculoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
