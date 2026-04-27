package com.promssac.backend.repository;

import com.promssac.backend.model.entity.Vehiculo;
import com.promssac.backend.model.enums.EstadoVehiculo;
import com.promssac.backend.model.enums.TipoVehiculo;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, UUID> {

    Optional<Vehiculo> findByPlaca(String placa);

    boolean existsByPlaca(String placa);

    List<Vehiculo> findByEstado(EstadoVehiculo estado);

    List<Vehiculo> findByTipo(TipoVehiculo tipo);

    List<Vehiculo> findByGrupo(String grupo);

    long countByEstado(EstadoVehiculo estado);
}
