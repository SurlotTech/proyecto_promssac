package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.SubestadoWriteRequest;
import com.promssac.backend.model.dto.response.SubestadoResponse;
import com.promssac.backend.model.entity.Subestado;
import com.promssac.backend.repository.SubestadoRepository;
import com.promssac.backend.service.SubestadoService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubestadoServiceImpl implements SubestadoService {

    private final SubestadoRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<SubestadoResponse> listar(boolean incluirInactivos) {
        List<Subestado> list = incluirInactivos
                ? repository.findAllByOrderByNombreAsc()
                : repository.findByActivoTrueOrderByNombreAsc();
        return list.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubestadoResponse> listarPorEstadoPadre(String estadoPadre) {
        return repository.findByEstadoPadreAndActivoTrueOrderByNombreAsc(estadoPadre)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public SubestadoResponse crear(SubestadoWriteRequest request) {
        String nombre = request.getNombre().trim();
        if (repository.existsByNombreIgnoreCase(nombre)) {
            throw new BusinessException("Ya existe un subestado con ese nombre.");
        }
        Subestado s = new Subestado();
        s.setNombre(nombre);
        s.setEstadoPadre(request.getEstadoPadre().trim());
        return toResponse(repository.save(s));
    }

    @Override
    @Transactional
    public SubestadoResponse actualizar(UUID id, SubestadoWriteRequest request) {
        Subestado s = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subestado", id));
        String nombre = request.getNombre().trim();
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new BusinessException("Ya existe un subestado con ese nombre.");
        }
        s.setNombre(nombre);
        s.setEstadoPadre(request.getEstadoPadre().trim());
        return toResponse(repository.save(s));
    }

    @Override
    @Transactional
    public void setActivo(UUID id, boolean activo) {
        Subestado s = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subestado", id));
        s.setActivo(activo);
        repository.save(s);
    }

    private SubestadoResponse toResponse(Subestado s) {
        SubestadoResponse r = new SubestadoResponse();
        r.setId(s.getId().toString());
        r.setNombre(s.getNombre());
        r.setEstadoPadre(s.getEstadoPadre());
        r.setActivo(s.getActivo());
        return r;
    }
}
