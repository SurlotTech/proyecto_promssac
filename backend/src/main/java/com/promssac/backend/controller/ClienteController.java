package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.ClientActivoPatchRequest;
import com.promssac.backend.model.dto.request.ClientBulkImportRequest;
import com.promssac.backend.model.dto.request.ClientWriteRequest;
import com.promssac.backend.model.dto.response.ClientBulkImportResponse;
import com.promssac.backend.model.dto.response.ClientResponse;
import com.promssac.backend.model.dto.response.OrderResponse;
import com.promssac.backend.service.ClienteService;
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
@RequestMapping("/api/v1/clientes")
@Validated
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<ClientResponse>> listar(
            @RequestParam(name = "incluirInactivos", defaultValue = "false") boolean incluirInactivos) {
        return ResponseEntity.ok(clienteService.listarParaOperaciones(incluirInactivos));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClientResponse>> buscar(
            @RequestParam(name = "q") String query) {
        return ResponseEntity.ok(clienteService.buscarPorNombre(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(clienteService.obtener(id));
    }

    @GetMapping("/{id}/ordenes")
    public ResponseEntity<List<OrderResponse>> ordenesRelacionadas(@PathVariable UUID id) {
        return ResponseEntity.ok(clienteService.listarOrdenesRelacionadas(id));
    }

    @PostMapping
    public ResponseEntity<ClientResponse> crear(@Valid @RequestBody ClientWriteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(request));
    }

    @PostMapping("/importacion/lote")
    public ResponseEntity<ClientBulkImportResponse> importarEnLote(@Valid @RequestBody ClientBulkImportRequest body) {
        return ResponseEntity.status(HttpStatus.OK).body(clienteService.importarEnLote(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> actualizar(@PathVariable UUID id, @Valid @RequestBody ClientWriteRequest request) {
        return ResponseEntity.ok(clienteService.actualizar(id, request));
    }

    /** Activar o desactivar (no borra físicamente). */
    @PatchMapping("/{id}/activo")
    public ResponseEntity<ClientResponse> cambiarActivo(
            @PathVariable UUID id, @Valid @RequestBody ClientActivoPatchRequest body) {
        return ResponseEntity.ok(clienteService.cambiarActivo(id, body));
    }
}
