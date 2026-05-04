package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderAssignBulkRequest {

    @NotNull
    private UUID rutaId;

    @NotEmpty
    private List<@NotBlank @Size(max = 64) String> numerosOrden;
}
