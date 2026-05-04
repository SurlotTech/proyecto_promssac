package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.OrderAssignBulkRequest;
import com.promssac.backend.model.dto.request.OrderCreateRequest;
import com.promssac.backend.model.dto.response.OrderResponse;
import java.util.List;

public interface OrdenService {

    List<OrderResponse> listarParaOperaciones();

    OrderResponse crear(OrderCreateRequest request);

    void asignarRutaMasivo(OrderAssignBulkRequest request);
}
