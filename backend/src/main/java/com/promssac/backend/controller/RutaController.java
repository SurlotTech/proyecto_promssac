package com.promssac.backend.controller;

import com.promssac.backend.model.dto.response.RouteResponse;
import com.promssac.backend.service.RutaService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rutas")
@RequiredArgsConstructor
public class RutaController {

    private final RutaService rutaService;

    @GetMapping
    public ResponseEntity<List<RouteResponse>> listar() {
        return ResponseEntity.ok(rutaService.listarParaOperaciones());
    }
}
