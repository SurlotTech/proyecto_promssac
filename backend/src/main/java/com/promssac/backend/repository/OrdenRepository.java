package com.promssac.backend.repository;

import com.promssac.backend.model.entity.Orden;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrdenRepository extends JpaRepository<Orden, UUID> {

    Optional<Orden> findByNumeroOrden(String numeroOrden);

    @Query("select o from Orden o left join fetch o.vehiculo left join fetch o.ruta")
    List<Orden> findAllFetched();
}
