package com.promssac.backend.model.dto.response;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RouteOrderBulkImportResponse {

    private int rutasCreadas;
    private int ordenesCreadas;
    private int productosCreados;
    private List<String> errores = new ArrayList<>();
    private List<String> mensajes = new ArrayList<>();
}
