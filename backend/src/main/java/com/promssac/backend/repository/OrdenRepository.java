package com.promssac.backend.repository;

import com.promssac.backend.model.entity.Orden;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrdenRepository extends JpaRepository<Orden, UUID> {

    @Query(
            "select o from Orden o left join fetch o.vehiculo left join fetch o.ruta left join fetch o.cliente "
                    + "where o.numeroOrden = :numeroOrden")
    Optional<Orden> findByNumeroOrden(@Param("numeroOrden") String numeroOrden);

    long countByRuta_Id(UUID rutaId);

    long countByCliente_Id(UUID clienteId);

    @Query(
            "select distinct o from Orden o "
                    + "left join fetch o.vehiculo "
                    + "left join fetch o.ruta "
                    + "left join fetch o.cliente "
                    + "where o.ruta.id = :rutaId "
                    + "order by o.numeroOrden asc")
    List<Orden> findFetchedByRutaId(@Param("rutaId") UUID rutaId);

    @Query("select o from Orden o left join fetch o.vehiculo left join fetch o.ruta left join fetch o.cliente")
    List<Orden> findAllFetched();

    @Query(
            "select distinct o from Orden o "
                    + "left join fetch o.vehiculo "
                    + "left join fetch o.ruta "
                    + "left join fetch o.cliente "
                    + "where o.cliente.id = :clienteId "
                    + "order by o.numeroOrden asc")
    List<Orden> findFetchedByClienteId(@Param("clienteId") UUID clienteId);

    @Query(
            "select o.cliente.id, count(o) from Orden o "
                    + "where o.cliente is not null and o.cliente.id in :ids "
                    + "group by o.cliente.id")
    List<Object[]> countGroupedByClienteIdIn(@Param("ids") Collection<UUID> ids);

    @Query("select o.numeroOrden, o.estado, coalesce(o.subestado, ''), "
            + "coalesce(o.vehiculoPlaca, '—'), o.fechaRuta, o.creadoEn "
            + "from Orden o order by o.creadoEn desc")
    List<Object[]> findLiteForAlertas();

    @Query("select o.numeroOrden, o.estado, o.subestado, o.vehiculoPlaca, "
            + "coalesce(c.nombre, ''), o.contactoNombre, o.contactoIdentificador, o.contactoTelefono, "
            + "coalesce(r.conductorMovil, coalesce(v.conductor, '')), "
            + "o.direccionLinea, o.fechaRuta "
            + "from Orden o left join o.ruta r left join o.vehiculo v left join o.cliente c "
            + "where o.ruta.id = :rutaId order by o.numeroOrden asc")
    List<Object[]> findLiteByRutaId(@Param("rutaId") UUID rutaId);
}
