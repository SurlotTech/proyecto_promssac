package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.VehiculoRequest;
import com.promssac.backend.model.dto.response.VehiculoResponse;
import com.promssac.backend.model.entity.Vehiculo;
import com.promssac.backend.repository.VehiculoRepository;
import com.promssac.backend.service.VehiculoService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class VehiculoServiceImpl implements VehiculoService {

    private final VehiculoRepository vehiculoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VehiculoResponse> listarTodos() {
        return vehiculoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VehiculoResponse buscarPorId(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public VehiculoResponse crear(VehiculoRequest request) {
        if (vehiculoRepository.existsByPlaca(request.getPlaca())) {
            throw new BusinessException("Ya existe un vehículo con la placa: " + request.getPlaca());
        }
        Vehiculo vehiculo = toEntity(new Vehiculo(), request);
        Vehiculo guardado = vehiculoRepository.save(vehiculo);
        log.info("Vehículo creado id={} placa={}", guardado.getId(), guardado.getPlaca());
        return toResponse(guardado);
    }

    @Override
    @Transactional
    public VehiculoResponse actualizar(UUID id, VehiculoRequest request) {
        Vehiculo vehiculo = findOrThrow(id);
        boolean placaCambiada = !vehiculo.getPlaca().equalsIgnoreCase(request.getPlaca());
        if (placaCambiada && vehiculoRepository.existsByPlaca(request.getPlaca())) {
            throw new BusinessException("Ya existe un vehículo con la placa: " + request.getPlaca());
        }
        toEntity(vehiculo, request);
        Vehiculo actualizado = vehiculoRepository.save(vehiculo);
        log.info("Vehículo actualizado id={}", actualizado.getId());
        return toResponse(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        findOrThrow(id);
        vehiculoRepository.deleteById(id);
        log.info("Vehículo eliminado id={}", id);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Vehiculo findOrThrow(UUID id) {
        return vehiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo", id));
    }

    private Vehiculo toEntity(Vehiculo vehiculo, VehiculoRequest r) {
        //copia las propiedades de la request al vehiculo entity
        BeanUtils.copyProperties(r, vehiculo);
        vehiculo.setPlaca(r.getPlaca().toUpperCase());
        return vehiculo;
    }

    //copia las propiedades del vehiculo entity al response y retorna el response
    private VehiculoResponse toResponse(Vehiculo v) {
        VehiculoResponse response = new VehiculoResponse();
        BeanUtils.copyProperties(v, response);
        return response;
    }
}
