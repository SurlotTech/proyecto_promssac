package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.OrderAssignBulkRequest;
import com.promssac.backend.model.dto.request.OrderCompleteRequest;
import com.promssac.backend.model.dto.request.OrderCreateRequest;
import com.promssac.backend.model.dto.response.OrderResponse;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface OrdenService {

    List<OrderResponse> listarParaOperaciones();

    /** Órdenes cuya ruta asignada coincide con {@code rutaId} (lista detalle operaciones). */
    List<OrderResponse> listarPorRutaId(UUID rutaId);

    OrderResponse obtenerPorNumero(String numeroOrden);

    OrderResponse crear(OrderCreateRequest request);

    OrderResponse completarDatos(OrderCompleteRequest request);

    void asignarRutaMasivo(OrderAssignBulkRequest request);

    /** Órdenes vinculadas al cliente de catálogo {@code clienteId}. */
    List<OrderResponse> listarPorClienteId(UUID clienteId);

    long contarPorClienteId(UUID clienteId);

    /**
     * Cuentas de órdenes por {@code cliente_id}, en una o varias consultas. Claves = UUID del cliente.
     */
    Map<UUID, Long> contarAgrupadoPorClienteId(Collection<UUID> clienteIds);
}

