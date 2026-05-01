package com.promssac.backend.repository;

import com.promssac.backend.model.entity.DispositivoFlota;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DispositivoFlotaRepository extends JpaRepository<DispositivoFlota, UUID> {

    @Query("select d from DispositivoFlota d join fetch d.vehiculo")
    List<DispositivoFlota> findAllFetched();
}
