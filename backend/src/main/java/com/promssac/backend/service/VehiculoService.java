package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.VehicleWriteRequest;
import com.promssac.backend.model.dto.response.VehicleResponse;
import java.util.List;
import java.util.UUID;

public interface VehiculoService {

    List<VehicleResponse> listar();

    VehicleResponse obtener(UUID id);

    VehicleResponse crear(VehicleWriteRequest request);

    VehicleResponse actualizar(UUID id, VehicleWriteRequest request);

    void eliminar(UUID id);
}
