package com.promssac.backend.repository;

import com.promssac.backend.model.entity.UsuarioMovil;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioMovilRepository extends JpaRepository<UsuarioMovil, UUID> {

    boolean existsByNombreUsuarioIgnoreCase(String nombreUsuario);

    boolean existsByNombreUsuarioIgnoreCaseAndIdNot(String nombreUsuario, UUID id);

    @Query("SELECT u FROM UsuarioMovil u JOIN FETCH u.vehiculo ORDER BY u.creadoEn DESC")
    List<UsuarioMovil> findAllWithVehiculoOrderByCreadoEnDesc();

    @Query("SELECT u FROM UsuarioMovil u JOIN FETCH u.vehiculo WHERE u.id = :id")
    Optional<UsuarioMovil> findWithVehiculoById(@Param("id") UUID id);

    @Query("SELECT u FROM UsuarioMovil u JOIN FETCH u.vehiculo v WHERE v.id IN :ids")
    List<UsuarioMovil> findByVehiculoIdInWithVehiculo(@Param("ids") Collection<UUID> ids);
}
