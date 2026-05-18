package com.promssac.backend.repository;

import com.promssac.backend.model.entity.ComentarioOrden;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComentarioOrdenRepository extends JpaRepository<ComentarioOrden, UUID> {

    List<ComentarioOrden> findByOrdenNumeroOrdenOrderByCreadoEnAsc(String numeroOrden);
}
