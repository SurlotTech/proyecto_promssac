package com.promssac.backend.controller;

import com.promssac.backend.model.dto.response.DocumentoConsultaDto;
import com.promssac.backend.service.FactilizaConsultaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/consultas")
@RequiredArgsConstructor
public class ConsultaDocumentoController {

    private final FactilizaConsultaService factilizaConsultaService;

    @GetMapping("/dni/{dni}")
    public DocumentoConsultaDto consultarDni(@PathVariable String dni) {
        return factilizaConsultaService.consultarDni(dni.trim());
    }

    @GetMapping("/ruc/{ruc}")
    public DocumentoConsultaDto consultarRuc(@PathVariable String ruc) {
        return factilizaConsultaService.consultarRuc(ruc.trim());
    }
}
