package com.promssac.backend.service.impl;

import com.promssac.backend.model.dto.response.RouteResponse;
import com.promssac.backend.model.entity.Ruta;
import com.promssac.backend.repository.RutaRepository;
import com.promssac.backend.service.RutaService;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RutaServiceImpl implements RutaService {

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final DateTimeFormatter UI_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter UI_DATETIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter UI_TIME = DateTimeFormatter.ofPattern("HH:mm");

    private final RutaRepository rutaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RouteResponse> listarParaOperaciones() {
        return rutaRepository.findAllWithVehiculo().stream().map(this::toRouteResponse).toList();
    }

    private RouteResponse toRouteResponse(Ruta r) {
        RouteResponse dto = new RouteResponse();
        dto.setId(r.getCodigo());
        dto.setName(r.getNombre());
        dto.setVehicleId(r.getVehiculo().getId().toString());
        dto.setVehiclePlate(r.getVehiculo().getPlaca());
        dto.setMobileUser(r.getConductorMovil() == null ? "" : r.getConductorMovil());
        dto.setDispatchCompleted(r.getDespachosCompletados());
        dto.setDispatchTotal(r.getDespachosTotales());
        dto.setDeliveryDate(r.getFechaEntrega().format(UI_DATE));
        dto.setStartTime(r.getHoraInicio().format(UI_TIME));
        dto.setEndTime(r.getHoraFin().format(UI_TIME));
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
