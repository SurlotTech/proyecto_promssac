package com.promssac.backend.model.dto.response;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClientBulkImportResponse {

    private List<ClientResponse> creados = new ArrayList<>();

    private List<ClientBulkImportFailureResponse> fallos = new ArrayList<>();
}
