package com.promssac.backend.repository;

import com.promssac.backend.model.entity.AlertaConfig;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertaConfigRepository extends JpaRepository<AlertaConfig, UUID> {

    Optional<AlertaConfig> findFirstByOrderByActualizadoEnDesc();
}
