package com.promssac.backend.service;

import com.promssac.backend.model.dto.response.DocumentoConsultaDto;

public interface FactilizaConsultaService {

    DocumentoConsultaDto consultarDni(String dni);

    DocumentoConsultaDto consultarRuc(String ruc);
}
