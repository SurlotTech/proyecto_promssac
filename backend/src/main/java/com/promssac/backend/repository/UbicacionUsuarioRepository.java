package com.promssac.backend.repository;

import com.promssac.backend.model.entity.UbicacionUsuario;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UbicacionUsuarioRepository extends JpaRepository<UbicacionUsuario, UUID> {

    Optional<UbicacionUsuario> findByUserId(String userId);

    List<UbicacionUsuario> findByUltimoEnvioAfter(Instant threshold);

    @Modifying
    @Query("delete from UbicacionUsuario u where u.userId = :userId")
    void deleteByUserId(String userId);
}
