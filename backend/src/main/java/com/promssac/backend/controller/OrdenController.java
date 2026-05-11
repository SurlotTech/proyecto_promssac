package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.OrderAssignBulkRequest;
import com.promssac.backend.model.dto.request.OrderCompleteRequest;
import com.promssac.backend.model.dto.request.OrderCreateRequest;
import com.promssac.backend.model.dto.request.OrderProductLineCreateRequest;
import com.promssac.backend.model.dto.response.OrderProductLineResponse;
import com.promssac.backend.model.dto.response.OrderResponse;
import com.promssac.backend.service.OrdenProductoService;
import com.promssac.backend.service.OrdenService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ordenes")
@Validated
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;
    private final OrdenProductoService ordenProductoService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> listar() {
        return ResponseEntity.ok(ordenService.listarParaOperaciones());
    }

    @GetMapping("/{numeroOrden}")
    public ResponseEntity<OrderResponse> obtener(@PathVariable String numeroOrden) {
        return ResponseEntity.ok(ordenService.obtenerPorNumero(numeroOrden));
    }

    @GetMapping("/{numeroOrden}/productos")
    public ResponseEntity<List<OrderProductLineResponse>> listarProductos(@PathVariable String numeroOrden) {
        return ResponseEntity.ok(ordenProductoService.listarPorNumeroOrden(numeroOrden));
    }

    @PostMapping("/{numeroOrden}/productos")
    public ResponseEntity<OrderProductLineResponse> agregarProducto(
            @PathVariable String numeroOrden, @Valid @RequestBody OrderProductLineCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordenProductoService.agregar(numeroOrden, request));
    }

    @PutMapping("/{numeroOrden}/productos/{productoId}")
    public ResponseEntity<OrderProductLineResponse> actualizarProducto(
            @PathVariable String numeroOrden,
            @PathVariable UUID productoId,
            @Valid @RequestBody OrderProductLineCreateRequest request) {
        return ResponseEntity.ok(ordenProductoService.actualizar(numeroOrden, productoId, request));
    }

    @DeleteMapping("/{numeroOrden}/productos/{productoId}")
    public ResponseEntity<Void> eliminarProducto(
            @PathVariable String numeroOrden, @PathVariable UUID productoId) {
        ordenProductoService.eliminar(numeroOrden, productoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<OrderResponse> crear(@Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordenService.crear(request));
    }

    @PostMapping("/completar-datos")
    public ResponseEntity<OrderResponse> completarDatos(@Valid @RequestBody OrderCompleteRequest request) {
        return ResponseEntity.ok(ordenService.completarDatos(request));
    }

    @PostMapping("/asignacion-masiva")
    public ResponseEntity<Void> asignarRutaMasivo(@Valid @RequestBody OrderAssignBulkRequest request) {
        ordenService.asignarRutaMasivo(request);
        return ResponseEntity.noContent().build();
    }
}
