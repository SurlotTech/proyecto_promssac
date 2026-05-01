package com.promssac.backend.repository;

import com.promssac.backend.model.entity.Ruta;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RutaRepository extends JpaRepository<Ruta, UUID> {

    Optional<Ruta> findByCodigo(String codigo);

    @Query("select r from Ruta r join fetch r.vehiculo")
    List<Ruta> findAllWithVehiculo();
}
