package com.promssac.backend.repository;

import com.promssac.backend.model.entity.SesionActiva;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface SesionActivaRepository extends JpaRepository<SesionActiva, UUID> {

    Optional<SesionActiva> findByToken(String token);

    @Modifying
    @Query("delete from SesionActiva")
    void deleteAll();
}
