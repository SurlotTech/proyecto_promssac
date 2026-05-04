package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.RouteWriteRequest;
import com.promssac.backend.model.dto.response.RouteResponse;
import java.util.List;
import java.util.UUID;

public interface RutaService {

    List<RouteResponse> listarParaOperaciones();

    RouteResponse obtener(UUID id);

    RouteResponse crear(RouteWriteRequest request);

    RouteResponse actualizar(UUID id, RouteWriteRequest request);

    void eliminar(UUID id);
}
