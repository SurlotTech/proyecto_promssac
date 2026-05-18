package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    private String usuario;

    @NotBlank
    private String contrasena;
}
