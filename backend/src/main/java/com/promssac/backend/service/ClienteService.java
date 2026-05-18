package com.promssac.backend.service;

import com.promssac.backend.model.dto.request.ClientActivoPatchRequest;
import com.promssac.backend.model.dto.request.ClientBulkImportRequest;
import com.promssac.backend.model.dto.request.ClientWriteRequest;
import com.promssac.backend.model.dto.response.ClientBulkImportResponse;
import com.promssac.backend.model.dto.response.ClientResponse;
import com.promssac.backend.model.dto.response.OrderResponse;
import java.util.List;
import java.util.UUID;

public interface ClienteService {

    List<ClientResponse> listarParaOperaciones(boolean incluirInactivos);

    ClientResponse obtener(UUID id);

    ClientResponse crear(ClientWriteRequest request);

    /** Importa muchas filas en una petición; la persistencia del lote se hace en transacción aislada. */
    ClientBulkImportResponse importarEnLote(ClientBulkImportRequest request);

    ClientResponse actualizar(UUID id, ClientWriteRequest request);

    /** Desactivación lógica (“eliminación” operativa). */
    ClientResponse cambiarActivo(UUID id, ClientActivoPatchRequest body);

    List<OrderResponse> listarOrdenesRelacionadas(UUID clienteId);

    /** Búsqueda rápida por nombre (máx. 10 resultados, solo activos). */
    List<ClientResponse> buscarPorNombre(String query);
}
