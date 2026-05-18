package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.EstadoWriteRequest;
import com.promssac.backend.model.dto.response.EstadoResponse;
import java.util.List;
import java.util.UUID;

public interface EstadoService {
    List<EstadoResponse> listarPadres(boolean incluirInactivos);
    List<EstadoResponse> listarHijos(UUID parentId, boolean incluirInactivos);
    List<EstadoResponse> listarHijosPorClavePadre(String clavePadre);
    EstadoResponse crear(EstadoWriteRequest request);
    EstadoResponse actualizar(UUID id, EstadoWriteRequest request);
    void setActivo(UUID id, boolean activo);
}
