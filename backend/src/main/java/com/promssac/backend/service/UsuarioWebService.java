package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.WebUserCreateRequest;
import com.promssac.backend.model.dto.request.WebUserUpdateRequest;
import com.promssac.backend.model.dto.response.ResourceIdResponse;
import com.promssac.backend.model.dto.response.WebUserDetailResponse;
import com.promssac.backend.model.dto.response.WebUserListItemResponse;
import java.util.List;
import java.util.UUID;

public interface UsuarioWebService {

    List<WebUserListItemResponse> listar();

    WebUserDetailResponse obtenerDetalle(UUID id);

    ResourceIdResponse crear(WebUserCreateRequest request);

    ResourceIdResponse actualizar(UUID id, WebUserUpdateRequest request);

    void setActivo(UUID id, boolean activo);
}
