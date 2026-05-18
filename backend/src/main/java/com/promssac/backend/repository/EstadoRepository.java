package com.promssac.backend.repository;

import com.promssac.backend.model.entity.Estado;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EstadoRepository extends JpaRepository<Estado, UUID> {

    @Query("SELECT e FROM Estado e LEFT JOIN FETCH e.parent WHERE e.parent IS NULL ORDER BY e.nombre ASC")
    List<Estado> findPadresWithParent();

    @Query("SELECT e FROM Estado e LEFT JOIN FETCH e.parent WHERE e.parent IS NULL AND e.activo = true ORDER BY e.nombre ASC")
    List<Estado> findPadresActivosWithParent();

    @Query("SELECT e FROM Estado e JOIN FETCH e.parent p WHERE p.nombre = :nombrePadre AND e.activo = true ORDER BY e.nombre ASC")
    List<Estado> findHijosActivosByNombrePadre(@Param("nombrePadre") String nombrePadre);

    @Query("SELECT e FROM Estado e LEFT JOIN FETCH e.parent WHERE e.parent.id = :parentId ORDER BY e.nombre ASC")
    List<Estado> findHijosByParentId(@Param("parentId") UUID parentId);

    @Query("SELECT e FROM Estado e LEFT JOIN FETCH e.parent WHERE e.parent.id = :parentId AND e.activo = true ORDER BY e.nombre ASC")
    List<Estado> findHijosActivosByParentId(@Param("parentId") UUID parentId);

    Optional<Estado> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, UUID id);

    @Query("SELECT e FROM Estado e LEFT JOIN FETCH e.parent WHERE e.parent IS NULL AND e.nombre = :nombre")
    Optional<Estado> findPadreByNombre(@Param("nombre") String nombre);
}
