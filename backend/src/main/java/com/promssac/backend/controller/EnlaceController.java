package com.promssac.backend.controller;

import com.promssac.backend.model.dto.response.EnlaceResponse;
import com.promssac.backend.service.OrdenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/enlace")
@RequiredArgsConstructor
public class EnlaceController {

    private final OrdenService ordenService;

    @GetMapping("/{numeroOrden}")
    public ResponseEntity<EnlaceResponse> obtener(@PathVariable String numeroOrden) {
        return ResponseEntity.ok(ordenService.obtenerParaEnlace(numeroOrden));
    }
}
