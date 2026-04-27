package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.VehiculoRequest;
import com.promssac.backend.model.dto.response.VehiculoResponse;
import java.util.List;
import java.util.UUID;

public interface VehiculoService {

    List<VehiculoResponse> listarTodos();

    VehiculoResponse buscarPorId(UUID id);

    VehiculoResponse crear(VehiculoRequest request);

    VehiculoResponse actualizar(UUID id, VehiculoRequest request);

    void eliminar(UUID id);
}
