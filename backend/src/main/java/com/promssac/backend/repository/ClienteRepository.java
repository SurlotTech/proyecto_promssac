package com.promssac.backend.repository;

import com.promssac.backend.model.dto.response.ClienteAutocompleteItem;
import com.promssac.backend.model.entity.Cliente;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {

    List<Cliente> findAllByOrderByNombreAsc();

    List<Cliente> findAllByActivoTrueOrderByNombreAsc();

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, UUID id);

    /** Nombres ya guardados (minúsculas, sin espacios extremos) que cruzan con {@code nombresNormalizados}. */
    @Query(
            """
            SELECT LOWER(TRIM(c.nombre)) FROM Cliente c
            WHERE LOWER(TRIM(c.nombre)) IN :nombres
            """)
    List<String> findNombresNormalizadosExistentesEn(@Param("nombres") Collection<String> nombres);

    @Query("""
            SELECT c FROM Cliente c
            WHERE c.activo = true
              AND (LOWER(c.nombre) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(COALESCE(c.codigoModularIiee, '')) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(COALESCE(c.nivelEducacion, '')) LIKE LOWER(CONCAT('%', :query, '%'))
              )
            ORDER BY c.nombre ASC
            LIMIT 10
            """)
    List<Cliente> searchByNombre(@Param("query") String query);

    @Query("SELECT c FROM Cliente c WHERE c.activo = true AND c.codigoModularIiee = :codigo ORDER BY c.nombre ASC LIMIT 1")
    Optional<Cliente> findByCodigoModularIiee(@Param("codigo") String codigo);

    @Query("SELECT c FROM Cliente c WHERE c.activo = true AND c.codigoModularIiee = :codigo AND LOWER(c.nivelEducacion) = LOWER(:nivel) ORDER BY c.nombre ASC LIMIT 1")
    Optional<Cliente> findByCodigoModularIieeAndNivel(@Param("codigo") String codigo, @Param("nivel") String nivel);

    @Query("""
            SELECT new com.promssac.backend.model.dto.response.ClienteAutocompleteItem(
                CAST(c.id AS string), c.email, c.nombre,
                COALESCE(c.nombreApellidosDirectorIiee, ''), COALESCE(c.codigoModularIiee, '')
            )
            FROM Cliente c
            WHERE c.activo = true
              AND c.email IS NOT NULL
              AND (
                  LOWER(c.email) LIKE LOWER(CONCAT('%', :q, '%'))
                  OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
                  OR LOWER(COALESCE(c.nombreApellidosDirectorIiee, '')) LIKE LOWER(CONCAT('%', :q, '%'))
              )
            ORDER BY c.nombre ASC
            LIMIT 8
            """)
    List<ClienteAutocompleteItem> autocompleteEmail(@Param("q") String q);
}

