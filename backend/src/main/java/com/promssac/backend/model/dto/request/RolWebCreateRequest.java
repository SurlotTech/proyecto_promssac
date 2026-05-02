package com.promssac.backend.model.dto.request;

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
public class RolWebCreateRequest {

    @NotBlank
    @Size(min = 2, max = 40)
    @Pattern(regexp = "^[a-z0-9_-]+$", message = "Solo minúsculas, números, guión y guión bajo.")
    private String clave;

    @NotBlank
    @Size(max = 200)
    private String nombre;

    @Size(max = 500)
    private String descripcion;

    @NotNull
    private Map<String, Boolean> permissions;
}
