package com.promssac.backend.repository;

import com.promssac.backend.model.entity.Subestado;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubestadoRepository extends JpaRepository<Subestado, UUID> {

    List<Subestado> findAllByOrderByNombreAsc();

    List<Subestado> findByActivoTrueOrderByNombreAsc();

    List<Subestado> findByEstadoPadreAndActivoTrueOrderByNombreAsc(String estadoPadre);

    Optional<Subestado> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, UUID id);
}
