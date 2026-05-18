package com.promssac.backend.repository;

import com.promssac.backend.model.entity.UsuarioWeb;
import com.promssac.backend.model.enums.ModoPermisoUsuarioWeb;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioWebRepository extends JpaRepository<UsuarioWeb, UUID> {

    boolean existsByNombreUsuarioIgnoreCase(String nombreUsuario);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByNombreUsuarioIgnoreCaseAndIdNot(String nombreUsuario, UUID id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);

    List<UsuarioWeb> findAllByOrderByCreadoEnDesc();

    List<UsuarioWeb> findAllByActivoTrueOrderByCreadoEnDesc();

    Optional<UsuarioWeb> findByNombreUsuarioIgnoreCaseOrEmailIgnoreCase(String nombreUsuario, String email);

    @Query(
            "SELECT COUNT(u) FROM UsuarioWeb u WHERE u.modoPermisos = :modo AND LOWER(u.rolClave) = LOWER(:clave)")
    long countUsuariosConRolClave(@Param("modo") ModoPermisoUsuarioWeb modo, @Param("clave") String clave);
}
