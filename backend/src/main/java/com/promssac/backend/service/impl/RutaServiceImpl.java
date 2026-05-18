package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.RouteWriteRequest;
import com.promssac.backend.model.dto.response.RouteResponse;
import com.promssac.backend.model.entity.Ruta;
import com.promssac.backend.model.entity.UsuarioMovil;
import com.promssac.backend.model.entity.Vehiculo;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.repository.RutaRepository;
import com.promssac.backend.repository.UsuarioMovilRepository;
import com.promssac.backend.repository.VehiculoRepository;
import com.promssac.backend.service.RutaService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class RutaServiceImpl implements RutaService {

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final DateTimeFormatter UI_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter UI_DATETIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final String PRIORIDAD_DEFECTO = "medium";
    private static final String ESTADO_DEFECTO = "scheduled";

    private final RutaRepository rutaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final UsuarioMovilRepository usuarioMovilRepository;
    private final OrdenRepository ordenRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RouteResponse> listarParaOperaciones() {
        return rutaRepository.findAllWithVehiculo().stream().map(this::toRouteResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RouteResponse obtener(UUID id) {
        Ruta r = rutaRepository
                .findWithVehiculoById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ruta", id));
        return toRouteResponse(r);
    }

    @Override
    @Transactional
    public RouteResponse crear(RouteWriteRequest request) {
        String codigo = resolverCodigoCrear(request.getCodigo());
        Vehiculo vehiculo = vehiculoRepository
                .findById(request.getVehiculoId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo", request.getVehiculoId()));

        Ruta r = new Ruta();
        r.setCodigo(codigo);
        aplicarCampos(r, request, vehiculo);
        r.setCreadoEn(Instant.now());

        return toRouteResponse(rutaRepository.save(r));
    }

    @Override
    @Transactional
    public RouteResponse actualizar(UUID id, RouteWriteRequest request) {
        Ruta r = rutaRepository
                .findWithVehiculoById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ruta", id));
        Vehiculo vehiculo = vehiculoRepository
                .findById(request.getVehiculoId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo", request.getVehiculoId()));

        if (StringUtils.hasText(request.getCodigo()) && !request.getCodigo().equalsIgnoreCase(r.getCodigo())) {
            rutaRepository.findByCodigo(request.getCodigo()).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw new BusinessException("Ya existe otra ruta con el código: " + request.getCodigo());
                }
            });
            r.setCodigo(request.getCodigo().trim());
        }

        aplicarCampos(r, request, vehiculo);
        return toRouteResponse(rutaRepository.save(r));
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        Ruta r = rutaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ruta", id));
        if (ordenRepository.countByRuta_Id(id) > 0) {
            throw new BusinessException("No se puede eliminar la ruta porque tiene órdenes asociadas.");
        }
        rutaRepository.delete(r);
    }

    private String resolverCodigoCrear(String solicitado) {
        if (StringUtils.hasText(solicitado)) {
            String c = solicitado.trim();
            if (c.length() > 32) {
                throw new BusinessException("El código de ruta no puede superar 32 caracteres.");
            }
            rutaRepository.findByCodigo(c).ifPresent(r -> {
                throw new BusinessException("Ya existe una ruta con el código: " + c);
            });
            return c;
        }
        for (int i = 0; i < 16; i++) {
            String candidate = "R" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
            if (rutaRepository.findByCodigo(candidate).isEmpty()) {
                return candidate;
            }
        }
        throw new BusinessException("No se pudo generar un código de ruta único.");
    }

    private void aplicarCampos(Ruta r, RouteWriteRequest request, Vehiculo vehiculo) {
        r.setNombre(request.getNombre().trim());
        r.setVehiculo(vehiculo);
        r.setFechaEntrega(request.getFechaEntrega());

        r.setPrioridad(StringUtils.hasText(request.getPrioridad()) ? request.getPrioridad().trim() : PRIORIDAD_DEFECTO);
        r.setEstado(StringUtils.hasText(request.getEstado()) ? request.getEstado().trim() : ESTADO_DEFECTO);
        r.setLugar(StringUtils.hasText(request.getLugar()) ? request.getLugar().trim() : null);

        r.setConductorMovil(resolverConductorMovil(request.getUsuarioMovilId()));

        r.setDespachosCompletados(coalesce(request.getDespachosCompletados(), r.getDespachosCompletados(), 0));
        r.setDespachosTotales(coalesce(request.getDespachosTotales(), r.getDespachosTotales(), 0));
        r.setCobroActual(coalesceMoney(request.getCobroActual(), r.getCobroActual()));
        r.setCobroTotal(coalesceMoney(request.getCobroTotal(), r.getCobroTotal()));
        r.setMontoEnRuta(coalesceMoney(request.getMontoEnRuta(), r.getMontoEnRuta()));
    }

    private static int coalesce(Integer incoming, Integer existing, int defaultIfBothNull) {
        if (incoming != null) {
            return incoming;
        }
        return existing != null ? existing : defaultIfBothNull;
    }

    private static BigDecimal coalesceMoney(BigDecimal incoming, BigDecimal existing) {
        if (incoming != null) {
            return incoming;
        }
        return existing != null ? existing : BigDecimal.ZERO;
    }

    private String resolverConductorMovil(UUID usuarioMovilId) {
        if (usuarioMovilId == null) {
            return null;
        }
        Optional<UsuarioMovil> u = usuarioMovilRepository.findById(usuarioMovilId);
        if (u.isEmpty()) {
            throw new ResourceNotFoundException("Usuario móvil", usuarioMovilId);
        }
        return u.get().getNombreCompleto();
    }

    private RouteResponse toRouteResponse(Ruta r) {
        RouteResponse dto = new RouteResponse();
        dto.setId(r.getId());
        dto.setCode(r.getCodigo());
        dto.setName(r.getNombre());
        dto.setVehicleId(r.getVehiculo().getId().toString());
        dto.setVehiclePlate(r.getVehiculo().getPlaca());
        dto.setMobileUser(r.getConductorMovil() == null ? "" : r.getConductorMovil());
        dto.setDispatchCompleted(r.getDespachosCompletados());
        dto.setDispatchTotal(r.getDespachosTotales());
        dto.setDeliveryDate(r.getFechaEntrega().format(UI_DATE));
        dto.setCreatedAt(r.getCreadoEn().atZone(LIMA).format(UI_DATETIME));
        dto.setPriority(r.getPrioridad());
        dto.setCurrentCollection(r.getCobroActual());
        dto.setTotalCollection(r.getCobroTotal());
        dto.setAmountInRoute(r.getMontoEnRuta());
        dto.setStatus(r.getEstado());
        dto.setPlace(r.getLugar() == null ? "" : r.getLugar());
        return dto;
    }
}
