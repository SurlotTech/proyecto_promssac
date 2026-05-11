package com.promssac.backend.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClientBulkImportRequest {

    @NotEmpty(message = "La lista de clientes no puede estar vacía.")
    @Size(max = 2000, message = "Máximo 2000 filas por solicitud.")
    @Valid
    private List<ClientWriteRequest> items;
}
