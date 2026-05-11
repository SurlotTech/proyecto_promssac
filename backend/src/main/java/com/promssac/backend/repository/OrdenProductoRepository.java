package com.promssac.backend.repository;

import com.promssac.backend.model.entity.OrdenProducto;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdenProductoRepository extends JpaRepository<OrdenProducto, UUID> {

    List<OrdenProducto> findByOrden_NumeroOrdenOrderByCreadoEnAsc(String numeroOrden);

    Optional<OrdenProducto> findByIdAndOrden_NumeroOrden(UUID id, String numeroOrden);
}
