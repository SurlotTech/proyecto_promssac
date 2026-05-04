package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.OrderAssignBulkRequest;
import com.promssac.backend.model.dto.request.OrderCreateRequest;
import com.promssac.backend.model.dto.response.OrderResponse;
import com.promssac.backend.service.OrdenService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ordenes")
@Validated
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> listar() {
        return ResponseEntity.ok(ordenService.listarParaOperaciones());
    }

    @PostMapping
    public ResponseEntity<OrderResponse> crear(@Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordenService.crear(request));
    }

    @PostMapping("/asignacion-masiva")
    public ResponseEntity<Void> asignarRutaMasivo(@Valid @RequestBody OrderAssignBulkRequest request) {
        ordenService.asignarRutaMasivo(request);
        return ResponseEntity.noContent().build();
    }
}
