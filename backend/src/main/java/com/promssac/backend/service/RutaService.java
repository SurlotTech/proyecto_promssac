package com.promssac.backend.service;

import com.promssac.backend.model.dto.response.RouteResponse;
import java.util.List;

public interface RutaService {

    List<RouteResponse> listarParaOperaciones();
}
