package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WebUserCreateRequest {

    @NotBlank
    @Size(max = 200)
    private String nombreCompleto;

    @NotBlank
    @Size(max = 120)
    @Pattern(regexp = "\\S+", message = "no debe contener espacios")
    private String nombreUsuario;

    @NotBlank
    @Email
    @Size(max = 200)
    private String email;

    @NotBlank
    @Size(min = 8, max = 128)
    private String contrasena;

    @NotBlank
    @Pattern(regexp = "(?i)rol|personalizado", message = "debe ser rol o personalizado")
    private String permissionMode;

    @Size(max = 40)
    private String roleKey;

    @NotNull
    private Map<String, Boolean> permissions;
}
