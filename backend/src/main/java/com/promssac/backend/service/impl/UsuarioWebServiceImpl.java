package com.promssac.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.WebUserCreateRequest;
import com.promssac.backend.model.dto.request.WebUserUpdateRequest;
import com.promssac.backend.model.dto.response.WebUserCreatedResponse;
import com.promssac.backend.model.dto.response.WebUserDetailResponse;
import com.promssac.backend.model.dto.response.WebUserListItemResponse;
import com.promssac.backend.model.entity.UsuarioWeb;
import com.promssac.backend.model.enums.ModoPermisoUsuarioWeb;
import com.promssac.backend.repository.UsuarioWebRepository;
import com.promssac.backend.service.UsuarioWebService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UsuarioWebServiceImpl implements UsuarioWebService {

    private static final DateTimeFormatter ULTIMA_CONEX_UI =
            DateTimeFormatter.ofPattern("dd-MM-yy HH:mm", Locale.ROOT);
    private static final Set<String> ROLES_VALIDOS = Set.of("admin", "supervisor", "operador");
    private static final String PERMISOS_VACIOS = "{}";
    private static final String MSG_USUARIO_DUPLICADO = "Ya existe un usuario con ese nombre de usuario.";
    private static final String MSG_EMAIL_DUPLICADO = "Ya existe un usuario con ese correo.";

    private final UsuarioWebRepository usuarioWebRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    private record RolPermisos(String rolClave, String permisosJson) {}

    @Override
    @Transactional(readOnly = true)
    public List<WebUserListItemResponse> listar() {
        return usuarioWebRepository.findAllByOrderByCreadoEnDesc().stream().map(this::toListItem).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WebUserDetailResponse obtenerDetalle(UUID id) {
        UsuarioWeb u = usuarioWebRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario web", id));
        return toDetalleResponse(u);
    }

    @Override
    @Transactional
    public WebUserCreatedResponse crear(WebUserCreateRequest request) {
        String usuario = request.getNombreUsuario().trim();
        String email = request.getEmail().trim();
        if (usuarioWebRepository.existsByNombreUsuarioIgnoreCase(usuario)) {
            throw new BusinessException(MSG_USUARIO_DUPLICADO);
        }
        if (usuarioWebRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(MSG_EMAIL_DUPLICADO);
        }

        ModoPermisoUsuarioWeb modo = ModoPermisoUsuarioWeb.fromApi(request.getPermissionMode());
        RolPermisos rp = resolverRolYPermisosJson(modo, request.getRoleKey(), request.getPermissions());

        UsuarioWeb entity = new UsuarioWeb();
        entity.setNombreCompleto(request.getNombreCompleto().trim());
        entity.setNombreUsuario(usuario);
        entity.setEmail(email);
        entity.setContrasenaHash(passwordEncoder.encode(request.getContrasena()));
        entity.setActivo(true);
        entity.setModoPermisos(modo);
        entity.setRolClave(rp.rolClave());
        entity.setPermisosJson(rp.permisosJson());

        UsuarioWeb guardado = usuarioWebRepository.save(entity);
        log.info("Usuario web creado id={} usuario={}", guardado.getId(), guardado.getNombreUsuario());

        return idResponse(guardado.getId());
    }

    @Override
    @Transactional
    public WebUserCreatedResponse actualizar(UUID id, WebUserUpdateRequest request) {
        UsuarioWeb entity = usuarioWebRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario web", id));

        String usuario = request.getNombreUsuario().trim();
        String email = request.getEmail().trim();
        if (usuarioWebRepository.existsByNombreUsuarioIgnoreCaseAndIdNot(usuario, id)) {
            throw new BusinessException(MSG_USUARIO_DUPLICADO);
        }
        if (usuarioWebRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new BusinessException(MSG_EMAIL_DUPLICADO);
        }

        String nueva = request.getContrasena();
        if (nueva != null && !nueva.isBlank()) {
            if (nueva.length() < 8) {
                throw new BusinessException("La contraseña debe tener al menos 8 caracteres.");
            }
            entity.setContrasenaHash(passwordEncoder.encode(nueva));
        }

        ModoPermisoUsuarioWeb modo = ModoPermisoUsuarioWeb.fromApi(request.getPermissionMode());
        RolPermisos rp = resolverRolYPermisosJson(modo, request.getRoleKey(), request.getPermissions());

        entity.setNombreCompleto(request.getNombreCompleto().trim());
        entity.setNombreUsuario(usuario);
        entity.setEmail(email);
        entity.setModoPermisos(modo);
        entity.setRolClave(rp.rolClave());
        entity.setPermisosJson(rp.permisosJson());

        UsuarioWeb guardado = usuarioWebRepository.save(entity);
        log.info("Usuario web actualizado id={} usuario={}", guardado.getId(), guardado.getNombreUsuario());

        return idResponse(guardado.getId());
    }

    @Override
    @Transactional
    public void setActivo(UUID id, boolean activo) {
        UsuarioWeb u = usuarioWebRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario web", id));
        u.setActivo(activo);
        usuarioWebRepository.save(u);
        log.info("Usuario web id={} activo={}", id, activo);
    }

    private RolPermisos resolverRolYPermisosJson(
            ModoPermisoUsuarioWeb modo, String roleKeyRaw, Map<String, Boolean> permisosMap) {
        if (modo == ModoPermisoUsuarioWeb.ROL) {
            String rk = roleKeyRaw == null ? "" : roleKeyRaw.trim();
            if (rk.isEmpty()) {
                throw new BusinessException("Selecciona un rol de usuario.");
            }
            if (!ROLES_VALIDOS.contains(rk.toLowerCase(Locale.ROOT))) {
                throw new BusinessException("Rol no reconocido.");
            }
            return new RolPermisos(rk.toLowerCase(Locale.ROOT), PERMISOS_VACIOS);
        }
        return new RolPermisos(null, serializarPermisos(permisosMap));
    }

    private static WebUserCreatedResponse idResponse(UUID id) {
        WebUserCreatedResponse dto = new WebUserCreatedResponse();
        dto.setId(id.toString());
        return dto;
    }

    private WebUserDetailResponse toDetalleResponse(UsuarioWeb u) {
        WebUserDetailResponse d = new WebUserDetailResponse();
        d.setId(u.getId().toString());
        d.setNombreCompleto(u.getNombreCompleto());
        d.setNombreUsuario(u.getNombreUsuario());
        d.setEmail(u.getEmail());
        d.setPermissionMode(u.getModoPermisos().getApiValue());
        d.setRoleKey(u.getRolClave() == null ? "" : u.getRolClave());
        d.setPermissions(parsePermisosJson(u.getPermisosJson()));
        return d;
    }

    private Map<String, Boolean> parsePermisosJson(String json) {
        if (json == null || json.isBlank() || PERMISOS_VACIOS.equals(json.trim())) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Boolean>>() {});
        } catch (JsonProcessingException e) {
            throw new BusinessException("Permisos almacenados inválidos.");
        }
    }

    private String serializarPermisos(Map<String, Boolean> permissions) {
        try {
            return objectMapper.writeValueAsString(permissions);
        } catch (JsonProcessingException e) {
            throw new BusinessException("No se pudo serializar los permisos.");
        }
    }

    private WebUserListItemResponse toListItem(UsuarioWeb u) {
        WebUserListItemResponse dto = new WebUserListItemResponse();
        dto.setId(u.getId().toString());
        dto.setNombreCompleto(u.getNombreCompleto());
        dto.setNombreUsuario(u.getNombreUsuario());
        dto.setEstado(Boolean.TRUE.equals(u.getActivo()) ? "Activo" : "Inactivo");
        dto.setRolPermisos(etiquetaRolPermisos(u));
        dto.setUltimaConexion(formatearUltimaConexion(u.getUltimaConexion()));
        return dto;
    }

    private static String etiquetaRolPermisos(UsuarioWeb u) {
        if (u.getModoPermisos() == ModoPermisoUsuarioWeb.PERSONALIZADO) {
            return "Personalizado";
        }
        String rk = u.getRolClave();
        if (rk == null) {
            return "-";
        }
        return switch (rk.toLowerCase(Locale.ROOT)) {
            case "admin" -> "Administrador";
            case "supervisor" -> "Supervisor";
            case "operador" -> "Operador";
            default -> rk;
        };
    }

    private static String formatearUltimaConexion(LocalDateTime t) {
        if (t == null) {
            return "-";
        }
        return t.format(ULTIMA_CONEX_UI) + " hrs";
    }
}
