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
            + "coalesce(o.estadoAnterior, 'pending'), "
            + "coalesce(o.vehiculoPlaca, '—'), o.fechaRuta, o.creadoEn, o.actualizadoEn "
            + "from Orden o order by o.creadoEn desc")
    List<Object[]> findLiteForAlertas();

    @Query("select o.numeroOrden, o.estado, o.subestado, o.vehiculoPlaca, "
            + "coalesce(c.nombre, ''), o.contactoNombre, o.contactoIdentificador, o.contactoTelefono, "
            + "coalesce(r.conductorMovil, coalesce(v.conductor, '')), "
            + "o.direccionLinea, o.fechaRuta "
            + "from Orden o left join o.ruta r left join o.vehiculo v left join o.cliente c "
            + "where o.ruta.id = :rutaId order by o.numeroOrden asc")
    List<Object[]> findLiteByRutaId(@Param("rutaId") UUID rutaId);

    @Query(value = """
            select r.codigo, r.nombre, coalesce(v.placa, ''),
                   r.fecha_entrega, coalesce(r.fecha_fin, r.fecha_entrega),
                   o.numero_orden, o.estado, coalesce(o.subestado, ''),
                   '', coalesce(o.contacto_identificador, ''),
                   coalesce(o.contacto_nombre, ''),
                   coalesce(o.contacto_telefono, ''), coalesce(o.contacto_email, ''),
                   coalesce(c.nivel_educacion, ''), coalesce(o.direccion_linea, ''),
                   coalesce(o.direccion_normalizada, ''), coalesce(o.fecha_ruta::text, ''),
                   coalesce(o.modo_entrega, ''), coalesce(o.prioridad_entrega, ''),
                   coalesce(o.campos_personalizados_json::json->>'director', ''),
                   coalesce(o.campos_personalizados_json::json->>'telefonoDirector', ''),
                   coalesce(o.campos_personalizados_json::json->>'paquetes', ''),
                   coalesce(o.campos_personalizados_json::json->>'actaEntrega', ''),
                   coalesce(o.campos_personalizados_json::json->>'guiaRemision', ''),
                   coalesce(o.campos_personalizados_json::json->>'guiaTransportista', ''),
                   coalesce(o.campos_personalizados_json::json->>'correoElectronico', ''),
                   coalesce(p.codigo, ''), coalesce(p.nombre, ''), p.cantidad,
                   coalesce(p.precio_unitario, 0), coalesce(p.peso_kg, 0),
                   coalesce(p.campo_personalizado, '')
            from ordenes o
            join rutas r on o.ruta_id = r.id
            left join vehiculos v on o.vehiculo_id = v.id
            left join clientes c on o.cliente_id = c.id
            left join orden_productos p on p.orden_id = o.id
            order by r.codigo, o.numero_orden, p.codigo
            """, nativeQuery = true)
    List<Object[]> findForExport();
}
