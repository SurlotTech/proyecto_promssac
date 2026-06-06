package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.RouteOrderBulkImportRequest;
import com.promssac.backend.model.dto.request.RouteWriteRequest;
import com.promssac.backend.model.dto.response.OrderResponse;
import com.promssac.backend.model.dto.response.RouteOrderBulkImportResponse;
import com.promssac.backend.model.dto.response.RouteResponse;
import com.promssac.backend.service.OrdenService;
import com.promssac.backend.service.RutaService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
@RequestMapping("/api/v1/rutas")
@Validated
@RequiredArgsConstructor
public class RutaController {

    private final RutaService rutaService;
    private final OrdenService ordenService;

    @GetMapping
    public ResponseEntity<List<RouteResponse>> listar() {
        return ResponseEntity.ok(rutaService.listarParaOperaciones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteResponse> obtener(@PathVariable UUID id) {
        return ResponseEntity.ok(rutaService.obtener(id));
    }

    @GetMapping("/{id}/ordenes")
    public ResponseEntity<List<OrderResponse>> listarOrdenesDeRuta(@PathVariable UUID id) {
        return ResponseEntity.ok(ordenService.listarPorRutaId(id));
    }

    @PostMapping
    public ResponseEntity<RouteResponse> crear(@Valid @RequestBody RouteWriteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rutaService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RouteResponse> actualizar(@PathVariable UUID id,
                                                    @Valid @RequestBody RouteWriteRequest request) {
        return ResponseEntity.ok(rutaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        rutaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/importacion-lote")
    public ResponseEntity<RouteOrderBulkImportResponse> importarLote(
            @Valid @RequestBody RouteOrderBulkImportRequest request) {
        return ResponseEntity.ok(rutaService.importarLote(request));
    }

    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportar() {
        byte[] excel = ordenService.exportarRutasOrdenesExcel();
        String filename = "rutas_ordenes_" + LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
    }
}
