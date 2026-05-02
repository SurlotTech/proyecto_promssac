package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.RolWebCreateRequest;
import com.promssac.backend.model.dto.request.RolWebUpdateRequest;
import com.promssac.backend.model.dto.response.ResourceIdResponse;
import com.promssac.backend.model.dto.response.RolWebDetailResponse;
import com.promssac.backend.model.dto.response.RolWebListItemResponse;
import com.promssac.backend.model.dto.response.RolWebOpcionResponse;
import java.util.List;
import java.util.UUID;

public interface RolWebService {

    List<RolWebListItemResponse> listar();

    List<RolWebOpcionResponse> listarOpcionesActivas();

    RolWebDetailResponse obtenerDetalle(UUID id);

    ResourceIdResponse crear(RolWebCreateRequest request);

    ResourceIdResponse actualizar(UUID id, RolWebUpdateRequest request);

    void setActivo(UUID id, boolean activo);
}
