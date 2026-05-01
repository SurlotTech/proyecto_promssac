package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.VehicleWriteRequest;
import com.promssac.backend.model.dto.response.VehicleOptionResponse;
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
    public List<VehicleOptionResponse> listarOpciones() {
        return vehiculoRepository.findAll().stream()
                .map(v -> new VehicleOptionResponse(
                        v.getId().toString(), v.getPlaca(), v.getTipo().getApiLabel()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse obtener(UUID id) {
        return toVehicleResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public VehicleResponse crear(VehicleWriteRequest request) {
        String placa = request.getPlate().trim().toUpperCase(Locale.ROOT);
        if (vehiculoRepository.existsByPlaca(placa)) {
            throw new BusinessException("Ya existe un vehículo con la placa: " + placa);
        }
        Vehiculo vehiculo = new Vehiculo();
        copyWriteRequestOntoEntity(vehiculo, request);
        Vehiculo guardado = vehiculoRepository.save(vehiculo);
        log.info("Vehículo creado id={} placa={}", guardado.getId(), guardado.getPlaca());
        return toVehicleResponse(guardado);
    }

    @Override
    @Transactional
    public VehicleResponse actualizar(UUID id, VehicleWriteRequest request) {
        Vehiculo vehiculo = findOrThrow(id);
        String placa = request.getPlate().trim().toUpperCase(Locale.ROOT);
        boolean placaCambiada = !vehiculo.getPlaca().equalsIgnoreCase(placa);
        if (placaCambiada && vehiculoRepository.existsByPlaca(placa)) {
            throw new BusinessException("Ya existe un vehículo con la placa: " + placa);
        }
        copyWriteRequestOntoEntity(vehiculo, request);
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

    private static void copyWriteRequestOntoEntity(Vehiculo entity, VehicleWriteRequest w) {
        entity.setPlaca(w.getPlate().trim().toUpperCase(Locale.ROOT));
        entity.setTipo(TipoVehiculo.fromApiLabel(w.getType()));
        entity.setGrupo(w.getGroup().trim());
        entity.setConductor(w.getDriver() == null || w.getDriver().isBlank() ? null : w.getDriver().trim());
        entity.setEstado(EstadoVehiculo.fromApiKey(w.getStatus()));
        entity.setCapacidadKg(w.getCapacityKg());
        entity.setPorcentajeCarga(w.getLoadPct());
        entity.setUltimoServicio(parseOptionalDate(w.getLastService()));
        entity.setAutoGestion(w.getAutoManaged());
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
