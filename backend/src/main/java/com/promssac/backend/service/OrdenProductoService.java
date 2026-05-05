package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.OrderProductLineCreateRequest;
import com.promssac.backend.model.dto.response.OrderProductLineResponse;
import java.util.List;

public interface OrdenProductoService {

    List<OrderProductLineResponse> listarPorNumeroOrden(String numeroOrden);

    OrderProductLineResponse agregar(String numeroOrden, OrderProductLineCreateRequest request);
}
