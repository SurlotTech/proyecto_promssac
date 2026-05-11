package com.promssac.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.OrderAssignBulkRequest;
import com.promssac.backend.model.dto.request.OrderCompleteRequest;
import com.promssac.backend.model.dto.request.OrderCreateRequest;
import com.promssac.backend.model.dto.response.OrderResponse;
import com.promssac.backend.model.entity.Cliente;
import com.promssac.backend.model.entity.Orden;
import com.promssac.backend.model.entity.Ruta;
import com.promssac.backend.model.entity.UsuarioMovil;
import com.promssac.backend.model.entity.Vehiculo;
import com.promssac.backend.repository.ClienteRepository;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.repository.RutaRepository;
import com.promssac.backend.repository.UsuarioMovilRepository;
import com.promssac.backend.repository.VehiculoRepository;
import com.promssac.backend.service.OrdenService;
import com.promssac.backend.validation.CorreoOpcionalValidator;
import com.promssac.backend.validation.GeoCoordinateValidator;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrdenServiceImpl implements OrdenService {

    private static final int MAX_ORDENES_ASIGNACION = 500;
    private static final String ESTADO_DEFECTO = "pending";

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final DateTimeFormatter UI_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final int MAX_IN_UUID_LOTE = 750;

    /** Misma heurística que en vehículos: activo primero, luego registro más reciente. */
    private static final Comparator<UsuarioMovil> PREFER_CONDUCTOR_MOVIL =
            Comparator.comparing((UsuarioMovil u) -> Boolean.TRUE.equals(u.getActivo()))
                    .thenComparing(UsuarioMovil::getCreadoEn, Comparator.reverseOrder());

    private final OrdenRepository ordenRepository;
    private final ClienteRepository clienteRepository;
    private final RutaRepository rutaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final UsuarioMovilRepository usuarioMovilRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> listarParaOperaciones() {
        return ordenRepository.findAllFetched().stream().map(this::toOrderResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> listarPorRutaId(UUID rutaId) {
        if (!rutaRepository.existsById(rutaId)) {
            throw new ResourceNotFoundException("Ruta", rutaId);
        }
        return ordenRepository.findFetchedByRutaId(rutaId).stream().map(this::toOrderResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> listarPorClienteId(UUID clienteId) {
        if (clienteId == null) {
            return List.of();
        }
        return ordenRepository.findFetchedByClienteId(clienteId).stream().map(this::toOrderResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPorClienteId(UUID clienteId) {
        if (clienteId == null) {
            return 0;
        }
        return ordenRepository.countByCliente_Id(clienteId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<UUID, Long> contarAgrupadoPorClienteId(Collection<UUID> clienteIds) {
        if (clienteIds == null || clienteIds.isEmpty()) {
            return Map.of();
        }
        LinkedHashSet<UUID> unicos = new LinkedHashSet<>(clienteIds);
        if (unicos.isEmpty()) {
            return Map.of();
        }
        Map<UUID, Long> resultado = new HashMap<>();
        List<UUID> lista = new ArrayList<>(unicos);
        for (int start = 0; start < lista.size(); start += MAX_IN_UUID_LOTE) {
            int end = Math.min(start + MAX_IN_UUID_LOTE, lista.size());
            List<UUID> slice = lista.subList(start, end);
            List<Object[]> filas = ordenRepository.countGroupedByClienteIdIn(slice);
            for (Object[] fila : filas) {
                if (fila == null || fila.length < 2 || fila[0] == null) {
                    continue;
                }
                UUID id = (UUID) fila[0];
                Number n = fila[1] instanceof Number ? (Number) fila[1] : null;
                if (n == null) {
                    continue;
                }
                resultado.merge(id, n.longValue(), Long::sum);
            }
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse obtenerPorNumero(String numeroOrden) {
        String num = numeroOrden == null ? "" : numeroOrden.trim();
        if (num.isEmpty()) {
            throw new ResourceNotFoundException("Orden", num);
        }
        Orden o = ordenRepository
                .findByNumeroOrden(num)
                .orElseThrow(() -> new ResourceNotFoundException("Orden", num));
        return toOrderResponse(o);
    }

    @Override
    @Transactional
    public OrderResponse crear(OrderCreateRequest request) {
        String numero = request.getNumeroOrden().trim();
        if (ordenRepository.findByNumeroOrden(numero).isPresent()) {
            throw new BusinessException("Ya existe una orden con el número: " + numero);
        }

        Orden o = new Orden();
        o.setNumeroOrden(numero);
        o.setFechaRuta(request.getFechaRuta());

        String estado = StringUtils.hasText(request.getEstado()) ? request.getEstado().trim() : ESTADO_DEFECTO;
        o.setEstado(estado);

        o.setSubestado(trimToNull(request.getSubestado()));
        if (request.getClienteId() != null) {
            Cliente cl = clienteRepository
                    .findById(request.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente", request.getClienteId()));
            o.setCliente(cl);
        }
        o.setContactoNombre(trimToNull(request.getContactoNombre()));
        o.setContactoIdentificador(trimToNull(request.getContactoIdentificador()));

        o.setEsUltimoDespacho(Boolean.TRUE.equals(request.getEsUltimoDespacho()));

        Ruta ruta = null;
        if (request.getRutaId() != null) {
            ruta = rutaRepository
                    .findWithVehiculoById(request.getRutaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ruta", request.getRutaId()));
            o.setRuta(ruta);
        }

        Vehiculo vehiculo = null;
        if (request.getVehiculoId() != null) {
            vehiculo = vehiculoRepository
                    .findById(request.getVehiculoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehículo", request.getVehiculoId()));
            o.setVehiculo(vehiculo);
            o.setVehiculoPlaca(vehiculo.getPlaca());
        } else if (ruta != null && ruta.getVehiculo() != null) {
            vehiculo = ruta.getVehiculo();
            o.setVehiculo(vehiculo);
            o.setVehiculoPlaca(vehiculo.getPlaca());
        }

        Instant now = Instant.now();
        o.setCreadoEn(now);
        o.setActualizadoEn(now);

        Orden guardada = ordenRepository.save(o);
        return toOrderResponse(guardada);
    }

    @Override
    @Transactional
    public OrderResponse completarDatos(OrderCompleteRequest request) {
        String numero = request.getNumeroOrden().trim();
        Orden o = ordenRepository
                .findByNumeroOrden(numero)
                .orElseThrow(() -> new ResourceNotFoundException("Orden", numero));

        aplicarSolicitudCompletar(o, request);

        if (!Boolean.TRUE.equals(request.getQuitarVehiculo())) {
            aplicarVehiculoDesdeRutaSiFalta(o);
        }

        o.setActualizadoEn(Instant.now());
        Orden guardada = ordenRepository.save(o);
        return toOrderResponse(guardada);
    }

    @Override
    @Transactional
    public void asignarRutaMasivo(OrderAssignBulkRequest request) {
        if (request.getNumerosOrden().size() > MAX_ORDENES_ASIGNACION) {
            throw new BusinessException("Máximo " + MAX_ORDENES_ASIGNACION + " órdenes por operación.");
        }

        Ruta ruta = rutaRepository
                .findWithVehiculoById(request.getRutaId())
                .orElseThrow(() -> new ResourceNotFoundException("Ruta", request.getRutaId()));

        Instant now = Instant.now();

        for (String raw : request.getNumerosOrden()) {
            String num = raw.trim();
            Orden o = ordenRepository
                    .findByNumeroOrden(num)
                    .orElseThrow(() -> new ResourceNotFoundException("Orden", num));
            o.setRuta(ruta);
            o.setFechaRuta(ruta.getFechaEntrega());
            if (o.getVehiculo() == null && ruta.getVehiculo() != null) {
                o.setVehiculo(ruta.getVehiculo());
                o.setVehiculoPlaca(ruta.getVehiculo().getPlaca());
            }
            o.setActualizadoEn(now);
            ordenRepository.save(o);
        }
    }

    private static String trimToNull(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        return s.trim();
    }

    /**
     * Si la orden tiene ruta pero ningún vehículo (común antes de quitarse {@code quitarVehiculo:false} defectuoso),
     * hereda conductor y placa del vehículo asignado a esa ruta.
     */
    private void aplicarVehiculoDesdeRutaSiFalta(Orden orden) {
        if (orden.getVehiculo() != null) {
            return;
        }
        if (orden.getRuta() == null || orden.getRuta().getId() == null) {
            return;
        }
        rutaRepository.findWithVehiculoById(orden.getRuta().getId()).ifPresent(r -> {
            if (r.getVehiculo() != null) {
                orden.setVehiculo(r.getVehiculo());
                orden.setVehiculoPlaca(r.getVehiculo().getPlaca());
            }
        });
    }

    private void aplicarSolicitudCompletar(Orden destino, OrderCompleteRequest request) {
        destino.setContactoNombre(trimToNull(request.getContactoNombre()));
        destino.setContactoIdentificador(trimToNull(request.getContactoIdentificador()));
        destino.setContactoTelefono(request.getContactoTelefono().trim());

        CorreoOpcionalValidator.assertValidoSiPresente(request.getContactoEmail());
        destino.setContactoEmail(trimToNull(request.getContactoEmail()));

        destino.setDireccionLinea(trimToNull(request.getDireccionLinea()));
        destino.setDireccionNormalizada(trimToNull(request.getDireccionNormalizada()));

        BigDecimal lat = request.getLatitud();
        BigDecimal lon = request.getLongitud();
        GeoCoordinateValidator.assertLatLon(lat, lon);
        destino.setLatitud(lat);
        destino.setLongitud(lon);

        destino.setTiempoServicioMinutos(request.getTiempoServicioMinutos());
        destino.setReferenciaDireccion(trimToNull(request.getReferenciaDireccion()));
        destino.setVentanaEntregaDesde(trimToNull(request.getVentanaEntregaDesde()));
        destino.setVentanaEntregaHasta(trimToNull(request.getVentanaEntregaHasta()));
        destino.setModoEntrega(trimToNull(request.getModoEntrega()));
        destino.setPrioridadEntrega(trimToNull(request.getPrioridadEntrega()));
        if (request.getContraEntrega() != null) {
            destino.setContraEntrega(request.getContraEntrega());
        }

        destino.setCamposPersonalizadosJson(serializeCamposPersonalizadosJson(request));

        if (Boolean.TRUE.equals(request.getQuitarVehiculo())) {
            destino.setVehiculo(null);
            destino.setVehiculoPlaca(null);
        } else if (request.getVehiculoId() != null) {
            Vehiculo v = vehiculoRepository
                    .findById(request.getVehiculoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehículo", request.getVehiculoId()));
            destino.setVehiculo(v);
            destino.setVehiculoPlaca(v.getPlaca());
        }
    }

    private String serializeCamposPersonalizadosJson(OrderCompleteRequest request) {
        if (request.getCamposPersonalizados() == null || request.getCamposPersonalizados().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(request.getCamposPersonalizados());
        } catch (JsonProcessingException e) {
            throw new BusinessException("Campos personalizados inválidos.");
        }
    }

    private OrderResponse toOrderResponse(Orden o) {
        OrderResponse dto = new OrderResponse();
        dto.setId(o.getNumeroOrden());
        dto.setStatus(o.getEstado());
        dto.setSubstatus(o.getSubestado() == null ? "" : o.getSubestado());
        dto.setVehiclePlate(o.getVehiculoPlaca() == null ? "—" : o.getVehiculoPlaca());
        if (o.getCliente() != null) {
            dto.setClientId(o.getCliente().getId().toString());
            dto.setClientName(
                    o.getCliente().getNombre() == null ? "" : o.getCliente().getNombre().trim());
        } else {
            dto.setClientName("");
        }
        dto.setRouteDate(o.getFechaRuta().format(UI_DATE));
        dto.setContactName(o.getContactoNombre() == null ? "" : o.getContactoNombre());
        dto.setContactIdentifier(o.getContactoIdentificador() == null ? "" : o.getContactoIdentificador());
        dto.setRouteDateIso(o.getFechaRuta().toString());
        dto.setCreatedAtIso(o.getCreadoEn().atZone(LIMA).toLocalDate().toString());
        dto.setLastDispatch(Boolean.TRUE.equals(o.getEsUltimoDespacho()));
        if (o.getRuta() != null) {
            dto.setRouteId(o.getRuta().getId().toString());
        }
        if (o.getVehiculo() != null) {
            dto.setVehicleId(o.getVehiculo().getId().toString());
        }
        String conductorNombre = resolverNombreConductor(o);
        if (StringUtils.hasText(conductorNombre)) {
            dto.setDriverName(conductorNombre.trim());
        }
        String conductorTelefono = resolverTelefonoConductor(o, conductorNombre);
        if (StringUtils.hasText(conductorTelefono)) {
            dto.setDriverPhone(conductorTelefono.trim());
        }

        mapearCamposCompletarRespuesta(dto, o);
        return dto;
    }

    /**
     * Nombre operativo para la UI: conductor móvil de la ruta, o campo {@code conductor} del vehículo de la orden
     * o de la propia ruta.
     */
    private String resolverNombreConductor(Orden o) {
        Ruta ruta = o.getRuta();
        if (ruta != null && StringUtils.hasText(ruta.getConductorMovil())) {
            return ruta.getConductorMovil().trim();
        }
        if (o.getVehiculo() != null && StringUtils.hasText(o.getVehiculo().getConductor())) {
            return o.getVehiculo().getConductor().trim();
        }
        if (ruta != null && ruta.getVehiculo() != null && StringUtils.hasText(ruta.getVehiculo().getConductor())) {
            return ruta.getVehiculo().getConductor().trim();
        }
        return null;
    }

    /** Teléfono del {@link UsuarioMovil} del vehículo de la ruta (o de la orden), alineado al nombre cuando coincide. */
    private String resolverTelefonoConductor(Orden o, String nombreConductorPreferido) {
        UUID vehiculoId = resolverVehiculoIdParaConductor(o);
        if (vehiculoId == null) {
            return null;
        }
        List<UsuarioMovil> candidatos =
                usuarioMovilRepository.findByVehiculoIdInWithVehiculo(List.of(vehiculoId));
        if (candidatos.isEmpty()) {
            return null;
        }
        if (StringUtils.hasText(nombreConductorPreferido)) {
            String pref = nombreConductorPreferido.trim();
            for (UsuarioMovil u : candidatos) {
                if (u.getNombreCompleto() != null
                        && pref.equalsIgnoreCase(u.getNombreCompleto().trim())) {
                    return trimTelefono(u.getTelefono());
                }
            }
        }
        UsuarioMovil elegido = candidatos.stream().max(PREFER_CONDUCTOR_MOVIL).orElse(null);
        return elegido != null ? trimTelefono(elegido.getTelefono()) : null;
    }

    private static UUID resolverVehiculoIdParaConductor(Orden o) {
        Ruta ruta = o.getRuta();
        if (ruta != null && ruta.getVehiculo() != null) {
            return ruta.getVehiculo().getId();
        }
        if (o.getVehiculo() != null) {
            return o.getVehiculo().getId();
        }
        return null;
    }

    private static String trimTelefono(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        return s.trim();
    }

    /** Datos persistidos del asistente Completar orden + JSON de campos personalizados. */
    private void mapearCamposCompletarRespuesta(OrderResponse dto, Orden o) {
        if (StringUtils.hasText(o.getContactoTelefono())) {
            dto.setContactPhone(o.getContactoTelefono().trim());
        }
        if (StringUtils.hasText(o.getContactoEmail())) {
            dto.setContactEmail(o.getContactoEmail().trim());
        }
        if (StringUtils.hasText(o.getDireccionLinea())) {
            dto.setAddressLine(o.getDireccionLinea().trim());
        }
        if (StringUtils.hasText(o.getDireccionNormalizada())) {
            dto.setNormalizedAddress(o.getDireccionNormalizada().trim());
        }
        if (o.getLatitud() != null) {
            dto.setLatitude(o.getLatitud().doubleValue());
        }
        if (o.getLongitud() != null) {
            dto.setLongitude(o.getLongitud().doubleValue());
        }
        if (o.getTiempoServicioMinutos() != null) {
            dto.setServiceMinutes(o.getTiempoServicioMinutos());
        }
        if (StringUtils.hasText(o.getReferenciaDireccion())) {
            dto.setAddressReference(o.getReferenciaDireccion().trim());
        }
        if (StringUtils.hasText(o.getVentanaEntregaDesde())) {
            dto.setDeliveryWindowFrom(o.getVentanaEntregaDesde().trim());
        }
        if (StringUtils.hasText(o.getVentanaEntregaHasta())) {
            dto.setDeliveryWindowTo(o.getVentanaEntregaHasta().trim());
        }
        if (StringUtils.hasText(o.getModoEntrega())) {
            dto.setDeliveryMode(o.getModoEntrega().trim());
        }
        if (StringUtils.hasText(o.getPrioridadEntrega())) {
            dto.setDeliveryPriority(o.getPrioridadEntrega().trim());
        }
        if (o.getContraEntrega() != null) {
            dto.setCashOnDelivery(o.getContraEntrega());
        }
        mapCustomFieldsIfAny(dto, o);
    }

    private void mapCustomFieldsIfAny(OrderResponse dto, Orden o) {
        if (!StringUtils.hasText(o.getCamposPersonalizadosJson())) {
            return;
        }
        try {
            Map<String, String> map = objectMapper.readValue(
                    o.getCamposPersonalizadosJson().trim(), new TypeReference<Map<String, String>>() {});
            if (map != null && !map.isEmpty()) {
                dto.setCustomFields(map);
            }
        } catch (JsonProcessingException e) {
            log.warn("Campos personalizados ilegibles para orden {}: {}", o.getNumeroOrden(), e.getMessage());
        }
    }
}
