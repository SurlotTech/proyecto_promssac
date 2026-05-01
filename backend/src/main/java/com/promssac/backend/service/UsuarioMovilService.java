package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.MobileUserCreateRequest;
import com.promssac.backend.model.dto.request.MobileUserUpdateRequest;
import com.promssac.backend.model.dto.response.MobileUserDetailResponse;
import com.promssac.backend.model.dto.response.MobileUserListItemResponse;
import com.promssac.backend.model.dto.response.MobileUserPhotoPayload;
import com.promssac.backend.model.dto.response.MobileUserRouteOptionResponse;
import com.promssac.backend.model.dto.response.MobileUserResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface UsuarioMovilService {

    List<MobileUserListItemResponse> listar();

    /** Solo usuarios activos; campos mínimos para combos de rutas. */
    List<MobileUserRouteOptionResponse> listarOpcionesParaRutas();

    MobileUserDetailResponse obtenerDetalle(UUID id);

    MobileUserResponse crear(MobileUserCreateRequest request, MultipartFile foto);

    MobileUserResponse actualizar(UUID id, MobileUserUpdateRequest request, MultipartFile foto);

    MobileUserPhotoPayload obtenerFoto(UUID usuarioMovilId);

    void setActivo(UUID id, boolean activo);
}
