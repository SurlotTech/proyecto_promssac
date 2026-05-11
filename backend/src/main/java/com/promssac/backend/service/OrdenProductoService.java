package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.OrderProductLineCreateRequest;
import com.promssac.backend.model.dto.response.OrderProductLineResponse;
import java.util.List;
import java.util.UUID;

public interface OrdenProductoService {

    List<OrderProductLineResponse> listarPorNumeroOrden(String numeroOrden);

    OrderProductLineResponse agregar(String numeroOrden, OrderProductLineCreateRequest request);

    OrderProductLineResponse actualizar(String numeroOrden, UUID productoId, OrderProductLineCreateRequest request);

    void eliminar(String numeroOrden, UUID productoId);
}
