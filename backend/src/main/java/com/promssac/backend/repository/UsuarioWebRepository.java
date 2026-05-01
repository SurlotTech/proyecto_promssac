package com.promssac.backend.repository;

import com.promssac.backend.model.entity.UsuarioWeb;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioWebRepository extends JpaRepository<UsuarioWeb, UUID> {

    boolean existsByNombreUsuarioIgnoreCase(String nombreUsuario);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByNombreUsuarioIgnoreCaseAndIdNot(String nombreUsuario, UUID id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);

    List<UsuarioWeb> findAllByOrderByCreadoEnDesc();
}
