package com.promssac.backend.model.dto.response;

import java.util.Map;
import lombok.Data;

@Data
public class LoginResponse {

    private String token;
    private UsuarioLoginDto usuario;

    @Data
    public static class UsuarioLoginDto {
        private String id;
        private String nombreCompleto;
        private String nombreUsuario;
        private String email;
        private String rolNombre;
        private Map<String, Boolean> permissions;
    }
}
