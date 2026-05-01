package com.promssac.backend.controller;

import com.promssac.backend.model.dto.response.OrderResponse;
import com.promssac.backend.service.OrdenService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> listar() {
        return ResponseEntity.ok(ordenService.listarParaOperaciones());
    }
}
