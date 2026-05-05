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
import com.promssac.backend.model.entity.Orden;
import com.promssac.backend.model.entity.Ruta;
import com.promssac.backend.model.entity.Vehiculo;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.repository.RutaRepository;
import com.promssac.backend.repository.VehiculoRepository;
import com.promssac.backend.service.OrdenService;
import com.promssac.backend.validation.CorreoOpcionalValidator;
import com.promssac.backend.validation.GeoCoordinateValidator;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
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

    private final OrdenRepository ordenRepository;
    private final RutaRepository rutaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> listarParaOperaciones() {
        return ordenRepository.findAllFetched().stream().map(this::toOrderResponse).toList();
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
        o.setClienteNombre(trimToNull(request.getClienteNombre()));
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
        dto.setClientName(o.getClienteNombre() == null ? "" : o.getClienteNombre());
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

        mapearCamposCompletarRespuesta(dto, o);
        return dto;
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
