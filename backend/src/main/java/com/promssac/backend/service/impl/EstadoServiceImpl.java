package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.EstadoWriteRequest;
import com.promssac.backend.model.dto.response.EstadoResponse;
import com.promssac.backend.model.entity.Estado;
import com.promssac.backend.repository.EstadoRepository;
import com.promssac.backend.service.EstadoService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EstadoServiceImpl implements EstadoService {

    private final EstadoRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<EstadoResponse> listarPadres(boolean incluirInactivos) {
        List<Estado> list = incluirInactivos
                ? repository.findPadresWithParent()
                : repository.findPadresActivosWithParent();
        return list.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadoResponse> listarHijos(UUID parentId, boolean incluirInactivos) {
        List<Estado> list = incluirInactivos
                ? repository.findHijosByParentId(parentId)
                : repository.findHijosActivosByParentId(parentId);
        return list.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadoResponse> listarHijosPorClavePadre(String clavePadre) {
        return repository.findHijosActivosByNombrePadre(clavePadre)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public EstadoResponse crear(EstadoWriteRequest request) {
        String nombre = request.getNombre().trim();
        if (repository.existsByNombreIgnoreCase(nombre)) {
            throw new BusinessException("Ya existe un estado con ese nombre.");
        }
        Estado e = new Estado();
        e.setNombre(nombre);
        if (request.getParentId() != null && !request.getParentId().isBlank()) {
            Estado parent = repository.findById(UUID.fromString(request.getParentId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Estado padre", request.getParentId()));
            if (parent.getParent() != null) {
                throw new BusinessException("El padre seleccionado ya es un subestado.");
            }
            e.setParent(parent);
        }
        return toResponse(repository.save(e));
    }

    @Override
    @Transactional
    public EstadoResponse actualizar(UUID id, EstadoWriteRequest request) {
        Estado e = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estado", id));
        String nombre = request.getNombre().trim();
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new BusinessException("Ya existe un estado con ese nombre.");
        }
        e.setNombre(nombre);
        if (request.getParentId() != null && !request.getParentId().isBlank()) {
            Estado parent = repository.findById(UUID.fromString(request.getParentId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Estado padre", request.getParentId()));
            if (parent.getParent() != null) {
                throw new BusinessException("El padre seleccionado ya es un subestado.");
            }
            e.setParent(parent);
        } else {
            e.setParent(null);
        }
        return toResponse(repository.save(e));
    }

    @Override
    @Transactional
    public void setActivo(UUID id, boolean activo) {
        Estado e = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estado", id));
        e.setActivo(activo);
        repository.save(e);
    }

    private EstadoResponse toResponse(Estado e) {
        EstadoResponse r = new EstadoResponse();
        r.setId(e.getId().toString());
        r.setNombre(e.getNombre());
        r.setParentId(e.getParent() != null ? e.getParent().getId().toString() : null);
        r.setParentNombre(e.parentNombre());
        r.setActivo(e.getActivo());
        r.setEsPadre(e.esPadre());
        return r;
    }
}
