package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderStatusPatchRequest {

    @Size(max = 40)
    private String estado;

    @Size(max = 200)
    private String subestado;
}
