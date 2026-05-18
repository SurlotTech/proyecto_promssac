package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.SubestadoWriteRequest;
import com.promssac.backend.model.dto.response.SubestadoResponse;
import java.util.List;
import java.util.UUID;

public interface SubestadoService {
    List<SubestadoResponse> listar(boolean incluirInactivos);
    List<SubestadoResponse> listarPorEstadoPadre(String estadoPadre);
    SubestadoResponse crear(SubestadoWriteRequest request);
    SubestadoResponse actualizar(UUID id, SubestadoWriteRequest request);
    void setActivo(UUID id, boolean activo);
}
