package com.promssac.backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Error de una fila dentro de un lote; el índice es 0-based respecto al payload del lote. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClientBulkImportFailureResponse {

    private int indexInBatch;

    private String nombreIntento;

    /** Mensaje legible (validación, duplicado, etc.). */
    private String motivo;
}
