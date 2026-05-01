package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.VehicleWriteRequest;
import com.promssac.backend.model.dto.request.VehiculoRequest;
import com.promssac.backend.model.dto.response.VehicleResponse;
import com.promssac.backend.model.entity.Vehiculo;
import com.promssac.backend.model.enums.EstadoVehiculo;
import com.promssac.backend.model.enums.TipoVehiculo;
import com.promssac.backend.repository.VehiculoRepository;
import com.promssac.backend.service.VehiculoService;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class VehiculoServiceImpl implements VehiculoService {

    private static final DateTimeFormatter UI_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter UI_DATETIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final VehiculoRepository vehiculoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> listar() {
        return vehiculoRepository.findAll().stream().map(this::toVehicleResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse obtener(UUID id) {
        return toVehicleResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public VehicleResponse crear(VehicleWriteRequest request) {
        VehiculoRequest internal = toVehiculoRequest(request);
        if (vehiculoRepository.existsByPlaca(internal.getPlaca())) {
            throw new BusinessException("Ya existe un vehículo con la placa: " + internal.getPlaca());
        }
        Vehiculo vehiculo = new Vehiculo();
        copyRequestOntoEntity(vehiculo, internal);
        Vehiculo guardado = vehiculoRepository.save(vehiculo);
        log.info("Vehículo creado id={} placa={}", guardado.getId(), guardado.getPlaca());
        return toVehicleResponse(guardado);
    }

    @Override
    @Transactional
    public VehicleResponse actualizar(UUID id, VehicleWriteRequest request) {
        VehiculoRequest internal = toVehiculoRequest(request);
        Vehiculo vehiculo = findOrThrow(id);
        boolean placaCambiada = !vehiculo.getPlaca().equalsIgnoreCase(internal.getPlaca());
        if (placaCambiada && vehiculoRepository.existsByPlaca(internal.getPlaca())) {
            throw new BusinessException("Ya existe un vehículo con la placa: " + internal.getPlaca());
        }
        copyRequestOntoEntity(vehiculo, internal);
        Vehiculo actualizado = vehiculoRepository.save(vehiculo);
        log.info("Vehículo actualizado id={}", actualizado.getId());
        return toVehicleResponse(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        findOrThrow(id);
        vehiculoRepository.deleteById(id);
        log.info("Vehículo eliminado id={}", id);
    }

    private Vehiculo findOrThrow(UUID id) {
        return vehiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo", id));
    }

    private static void copyRequestOntoEntity(Vehiculo entity, VehiculoRequest request) {
        BeanUtils.copyProperties(request, entity);
        entity.setPlaca(request.getPlaca().toUpperCase(Locale.ROOT));
    }

    private VehicleResponse toVehicleResponse(Vehiculo v) {
        VehicleResponse dto = new VehicleResponse();
        dto.setId(v.getId().toString());
        dto.setPlate(v.getPlaca());
        dto.setType(v.getTipo().getApiLabel());
        dto.setGroup(v.getGrupo());
        dto.setDriver(v.getConductor());
        dto.setStatus(v.getEstado().getApiKey());
        dto.setCapacityKg(v.getCapacidadKg());
        dto.setLoadPct(v.getPorcentajeCarga());
        dto.setLastService(v.getUltimoServicio() == null ? "" : v.getUltimoServicio().format(UI_DATE));
        dto.setCreatedAt(v.getCreadoEn() == null ? "" : v.getCreadoEn().format(UI_DATETIME));
        dto.setAutoManaged(Boolean.TRUE.equals(v.getAutoGestion()));
        return dto;
    }

    private static VehiculoRequest toVehiculoRequest(VehicleWriteRequest w) {
        return new VehiculoRequest(
                w.getPlate().trim().toUpperCase(Locale.ROOT),
                TipoVehiculo.fromApiLabel(w.getType()),
                w.getGroup().trim(),
                w.getDriver() == null || w.getDriver().isBlank() ? null : w.getDriver().trim(),
                EstadoVehiculo.fromApiKey(w.getStatus()),
                w.getCapacityKg(),
                w.getLoadPct(),
                parseOptionalDate(w.getLastService()),
                w.getAutoManaged());
    }

    private static LocalDate parseOptionalDate(String ddMmYyyy) {
        if (ddMmYyyy == null || ddMmYyyy.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(ddMmYyyy.trim(), UI_DATE);
        } catch (Exception ex) {
            throw new BusinessException("Fecha de último servicio inválida (use dd/MM/yyyy).");
        }
    }
}
