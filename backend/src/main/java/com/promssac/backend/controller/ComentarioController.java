package com.promssac.backend.controller;

import com.promssac.backend.model.dto.response.ComentarioResponse;
import com.promssac.backend.service.ComentarioService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ordenes/{numeroOrden}/comentarios")
@RequiredArgsConstructor
public class ComentarioController {

    private final ComentarioService comentarioService;

    @GetMapping
    public ResponseEntity<List<ComentarioResponse>> listar(@PathVariable String numeroOrden) {
        return ResponseEntity.ok(comentarioService.listar(numeroOrden));
    }

    @PostMapping
    public ResponseEntity<ComentarioResponse> agregar(
            @PathVariable String numeroOrden,
            @RequestParam("texto") String texto,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(comentarioService.agregar(numeroOrden, texto, archivo));
    }
}
