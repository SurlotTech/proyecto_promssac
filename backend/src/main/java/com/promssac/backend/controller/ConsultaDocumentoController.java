package com.promssac.backend.controller;

import com.promssac.backend.model.dto.response.DocumentoConsultaDto;
import com.promssac.backend.service.FactilizaConsultaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/consultas")
@RequiredArgsConstructor
public class ConsultaDocumentoController {

    private final FactilizaConsultaService factilizaService;

    @GetMapping("/dni/{numero}")
    public ResponseEntity<DocumentoConsultaDto> consultarDni(@PathVariable String numero) {
        return ResponseEntity.ok(factilizaService.consultarDni(numero));
    }

    @GetMapping("/ruc/{numero}")
    public ResponseEntity<DocumentoConsultaDto> consultarRuc(@PathVariable String numero) {
        return ResponseEntity.ok(factilizaService.consultarRuc(numero));
    }
}
