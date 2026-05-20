package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.UbicacionUsuarioRequest;
import com.promssac.backend.model.dto.response.UbicacionUsuarioResponse;
import java.util.List;

public interface GpsService {

    void registrarUbicacion(String userId, String userName, UbicacionUsuarioRequest request);

    List<UbicacionUsuarioResponse> listarUbicaciones();

    void eliminarUbicacion(String userId);
}
