package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.OrderAssignBulkRequest;
import com.promssac.backend.model.dto.request.OrderCreateRequest;
import com.promssac.backend.model.dto.response.OrderResponse;
import com.promssac.backend.model.entity.Orden;
import com.promssac.backend.model.entity.Ruta;
import com.promssac.backend.model.entity.Vehiculo;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.repository.RutaRepository;
import com.promssac.backend.repository.VehiculoRepository;
import com.promssac.backend.service.OrdenService;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class OrdenServiceImpl implements OrdenService {

    private static final int MAX_ORDENES_ASIGNACION = 500;
    private static final String ESTADO_DEFECTO = "pending";

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final DateTimeFormatter UI_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final OrdenRepository ordenRepository;
    private final RutaRepository rutaRepository;
    private final VehiculoRepository vehiculoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> listarParaOperaciones() {
        return ordenRepository.findAllFetched().stream().map(this::toOrderResponse).toList();
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
        return dto;
    }
}
