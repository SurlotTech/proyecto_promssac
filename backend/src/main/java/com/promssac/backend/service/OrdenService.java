package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.OrderAssignBulkRequest;
import com.promssac.backend.model.dto.request.OrderCompleteRequest;
import com.promssac.backend.model.dto.request.OrderCreateRequest;
import com.promssac.backend.model.dto.response.OrderResponse;
import java.util.List;

public interface OrdenService {

    List<OrderResponse> listarParaOperaciones();

    OrderResponse obtenerPorNumero(String numeroOrden);

    OrderResponse crear(OrderCreateRequest request);

    OrderResponse completarDatos(OrderCompleteRequest request);

    void asignarRutaMasivo(OrderAssignBulkRequest request);
}
