package com.promssac.backend.service;

import com.promssac.backend.model.dto.response.ComentarioResponse;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface ComentarioService {
    List<ComentarioResponse> listar(String numeroOrden);

    ComentarioResponse agregar(String numeroOrden, String texto, MultipartFile archivo);
}
