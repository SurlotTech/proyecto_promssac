package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ActivoPatchRequest {

    @NotNull
    private Boolean activo;
}
