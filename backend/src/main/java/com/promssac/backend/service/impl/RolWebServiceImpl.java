package com.promssac.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.RolWebCreateRequest;
import com.promssac.backend.model.dto.request.RolWebUpdateRequest;
import com.promssac.backend.model.dto.response.ResourceIdResponse;
import com.promssac.backend.model.dto.response.RolWebDetailResponse;
import com.promssac.backend.model.dto.response.RolWebListItemResponse;
import com.promssac.backend.model.dto.response.RolWebOpcionResponse;
import com.promssac.backend.model.entity.RolWeb;
import com.promssac.backend.model.enums.ModoPermisoUsuarioWeb;
import com.promssac.backend.repository.RolWebRepository;
import com.promssac.backend.repository.UsuarioWebRepository;
import com.promssac.backend.service.RolWebService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class RolWebServiceImpl implements RolWebService {

    private static final DateTimeFormatter ULTIMA_EDICION =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.ROOT);
    private static final String PERMISOS_VACIOS = "{}";

    private final RolWebRepository rolWebRepository;
    private final UsuarioWebRepository usuarioWebRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RolWebListItemResponse> listar() {
        return rolWebRepository.findAllByOrderByNombreAsc().stream().map(this::toListItem).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RolWebOpcionResponse> listarOpcionesActivas() {
        return rolWebRepository.findAllByActivoTrueOrderByNombreAsc().stream()
                .map(r -> new RolWebOpcionResponse(r.getClave(), r.getNombre()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RolWebDetailResponse obtenerDetalle(UUID id) {
        return toDetalleResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public ResourceIdResponse crear(RolWebCreateRequest request) {
        String clave = request.getClave().trim().toLowerCase(Locale.ROOT);
        if (rolWebRepository.existsByClaveIgnoreCase(clave)) {
            throw new BusinessException("Ya existe un rol con esa clave.");
        }
        RolWeb entity = new RolWeb();
        entity.setClave(clave);
        entity.setNombre(request.getNombre().trim());
        entity.setDescripcion(blankToNull(request.getDescripcion()));
        entity.setActivo(true);
        entity.setPermisosJson(serializarPermisos(request.getPermissions()));
        RolWeb guardado = rolWebRepository.save(entity);
        log.info("Rol web creado id={} clave={}", guardado.getId(), guardado.getClave());
        ResourceIdResponse dto = new ResourceIdResponse();
        dto.setId(guardado.getId().toString());
        return dto;
    }

    @Override
    @Transactional
    public ResourceIdResponse actualizar(UUID id, RolWebUpdateRequest request) {
        RolWeb entity = findOrThrow(id);
        entity.setNombre(request.getNombre().trim());
        entity.setDescripcion(blankToNull(request.getDescripcion()));
        entity.setPermisosJson(serializarPermisos(request.getPermissions()));
        rolWebRepository.save(entity);
        log.info("Rol web actualizado id={}", id);
        ResourceIdResponse dto = new ResourceIdResponse();
        dto.setId(id.toString());
        return dto;
    }

    @Override
    @Transactional
    public void setActivo(UUID id, boolean activo) {
        RolWeb r = findOrThrow(id);
        if (!activo
                && usuarioWebRepository.countUsuariosConRolClave(ModoPermisoUsuarioWeb.ROL, r.getClave()) > 0) {
            throw new BusinessException(
                    "No se puede desactivar el rol mientras tenga usuarios web asignados. Reasigna esos usuarios primero.");
        }
        r.setActivo(activo);
        rolWebRepository.save(r);
        log.info("Rol web id={} activo={}", id, activo);
    }

    private RolWeb findOrThrow(UUID id) {
        return rolWebRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Rol web", id));
    }

    private RolWebListItemResponse toListItem(RolWeb r) {
        RolWebListItemResponse dto = new RolWebListItemResponse();
        dto.setId(r.getId().toString());
        dto.setClave(r.getClave());
        dto.setNombre(r.getNombre());
        dto.setActivo(Boolean.TRUE.equals(r.getActivo()));
        dto.setPermisosActivos(contarPermisosActivos(r.getPermisosJson()));
        dto.setUsuariosAsignados(
                usuarioWebRepository.countUsuariosConRolClave(ModoPermisoUsuarioWeb.ROL, r.getClave()));
        LocalDateTime au = r.getActualizadoEn() != null ? r.getActualizadoEn() : r.getCreadoEn();
        dto.setUltimaEdicion(au == null ? "-" : au.format(ULTIMA_EDICION));
        return dto;
    }

    private RolWebDetailResponse toDetalleResponse(RolWeb r) {
        RolWebDetailResponse d = new RolWebDetailResponse();
        d.setId(r.getId().toString());
        d.setClave(r.getClave());
        d.setNombre(r.getNombre());
        d.setDescripcion(r.getDescripcion() == null ? "" : r.getDescripcion());
        d.setActivo(Boolean.TRUE.equals(r.getActivo()));
        d.setPermissions(parsePermisos(r.getPermisosJson()));
        return d;
    }

    private int contarPermisosActivos(String json) {
        Map<String, Boolean> m = parsePermisos(json);
        return (int) m.values().stream().filter(Boolean::booleanValue).count();
    }

    private Map<String, Boolean> parsePermisos(String json) {
        if (json == null || json.isBlank() || PERMISOS_VACIOS.equals(json.trim())) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Boolean>>() {});
        } catch (JsonProcessingException e) {
            throw new BusinessException("Permisos del rol inválidos.");
        }
    }

    private String serializarPermisos(Map<String, Boolean> permissions) {
        try {
            return objectMapper.writeValueAsString(permissions);
        } catch (JsonProcessingException e) {
            throw new BusinessException("No se pudo serializar los permisos.");
        }
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }
}
