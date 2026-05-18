package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SubestadoWriteRequest {

    @NotBlank
    @Size(max = 200)
    private String nombre;

    @NotBlank
    @Size(max = 40)
    private String estadoPadre;
}
