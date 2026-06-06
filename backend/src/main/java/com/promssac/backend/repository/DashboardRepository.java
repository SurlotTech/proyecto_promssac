package com.promssac.backend.repository;

import com.promssac.backend.model.entity.Orden;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DashboardRepository extends JpaRepository<Orden, UUID> {

    @Query("select count(o) from Orden o where o.estado in ('entregado','delivered','completed') "
            + "and o.actualizadoEn >= :inicio")
    long contarEntregasDesde(@Param("inicio") Instant inicio);

    @Query("select coalesce(sum(case when o.contraEntrega = true then 1 else 0 end), 0) "
            + "from Orden o "
            + "where o.estado in ('entregado','delivered','completed') "
            + "and o.actualizadoEn >= :inicio")
    long sumarRecaudacionDesde(@Param("inicio") Instant inicio);

    @Query("select count(r) from Ruta r where r.fechaEntrega = :fecha")
    long contarRutasPorFecha(@Param("fecha") LocalDate fecha);

    @Query("select count(v) from Vehiculo v")
    long contarVehiculos();

    @Query(value = """
            select extract(month from actualizado_en)::int as mes,
                   count(*) filter (where estado in ('entregado','delivered','completed')) as entregas,
                   count(*) filter (where estado not in ('entregado','delivered','completed')) as pendientes
            from ordenes
            where actualizado_en >= :inicio and actualizado_en < :fin
            group by extract(month from actualizado_en)
            order by mes
            """, nativeQuery = true)
    List<Object[]> performanceMensualEntre(@Param("inicio") Instant inicio, @Param("fin") Instant fin);

    @Query(value = """
            select coalesce(um.nombre_completo, coalesce(v.conductor, 'Sin asignar')),
                   count(o.id)
            from ordenes o
            left join vehiculos v on v.id = o.vehiculo_id
            left join usuarios_movil um on um.vehiculo_id = v.id
            where o.estado in ('entregado','delivered','completed')
              and o.actualizado_en >= :ini and o.actualizado_en < :end
            group by coalesce(um.nombre_completo, coalesce(v.conductor, 'Sin asignar'))
            order by count(o.id) desc
            limit 5
            """, nativeQuery = true)
    List<Object[]> topConductoresEntre(@Param("ini") Instant ini, @Param("end") Instant end);
}

