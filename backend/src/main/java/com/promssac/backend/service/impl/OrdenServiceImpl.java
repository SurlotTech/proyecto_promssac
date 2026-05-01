package com.promssac.backend.service.impl;

import com.promssac.backend.model.dto.response.OrderResponse;
import com.promssac.backend.model.entity.Orden;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.service.OrdenService;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrdenServiceImpl implements OrdenService {

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final DateTimeFormatter UI_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final OrdenRepository ordenRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> listarParaOperaciones() {
        return ordenRepository.findAllFetched().stream().map(this::toOrderResponse).toList();
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
        return dto;
    }
}
