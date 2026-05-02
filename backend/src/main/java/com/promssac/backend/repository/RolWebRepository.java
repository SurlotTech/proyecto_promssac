package com.promssac.backend.repository;

import com.promssac.backend.model.entity.RolWeb;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolWebRepository extends JpaRepository<RolWeb, UUID> {

    Optional<RolWeb> findByClaveIgnoreCase(String clave);

    boolean existsByClaveIgnoreCase(String clave);

    List<RolWeb> findAllByActivoTrueOrderByNombreAsc();

    List<RolWeb> findAllByOrderByNombreAsc();
}
