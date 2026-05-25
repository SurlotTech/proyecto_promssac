package com.promssac.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.LoginRequest;
import com.promssac.backend.model.dto.request.WebUserCreateRequest;
import com.promssac.backend.model.dto.request.WebUserUpdateRequest;
import com.promssac.backend.model.dto.response.LoginResponse;
import com.promssac.backend.model.dto.response.ResourceIdResponse;
import com.promssac.backend.model.dto.response.WebUserDetailResponse;
import com.promssac.backend.model.dto.response.WebUserListItemResponse;
import com.promssac.backend.model.entity.RolWeb;
import com.promssac.backend.model.entity.SesionActiva;
import com.promssac.backend.model.entity.UsuarioWeb;
import com.promssac.backend.model.enums.ModoPermisoUsuarioWeb;
import com.promssac.backend.repository.RolWebRepository;
import com.promssac.backend.repository.SesionActivaRepository;
import com.promssac.backend.repository.UsuarioWebRepository;
import com.promssac.backend.security.JwtTokenProvider;
import com.promssac.backend.security.WebUserDetails;
import com.promssac.backend.service.UsuarioWebService;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
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
    private static final String PERMISOS_VACIOS = "{}";
    private static final String ALL_PERMS_JSON = "{" +
            "\"g1\":true,\"g2\":true,\"g2-1\":true,\"g2-2\":true," +
            "\"g2-3\":true,\"g2-4\":true,\"g3\":true,\"g4\":true," +
            "\"g6\":true,\"a1\":true,\"a2\":true," +
            "\"a2-1\":true,\"a2-2\":true,\"a3\":true,\"a4\":true" +
            "}";
    private static final String MSG_USUARIO_DUPLICADO = "Ya existe un usuario con ese nombre de usuario.";
    private static final String MSG_EMAIL_DUPLICADO = "Ya existe un usuario con ese correo.";

    private final UsuarioWebRepository usuarioWebRepository;
    private final RolWebRepository rolWebRepository;
    private final SesionActivaRepository sesionActivaRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    private record RolPermisos(String rolClave, String permisosJson) {}

    @Override
    @Transactional(readOnly = true)
    public List<WebUserListItemResponse> listar(boolean incluirInactivos) {
        Map<String, String> nombrePorClave = indexarNombresRol();
        List<UsuarioWeb> usuarios = incluirInactivos
                ? usuarioWebRepository.findAllByOrderByCreadoEnDesc()
                : usuarioWebRepository.findAllByActivoTrueOrderByCreadoEnDesc();
        return usuarios.stream()
                .map(u -> toListItem(u, nombrePorClave))
                .toList();
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
    public ResourceIdResponse crear(WebUserCreateRequest request) {
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
    public ResourceIdResponse actualizar(UUID id, WebUserUpdateRequest request) {
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

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String usuario = request.getUsuario().trim();
        UsuarioWeb entity = usuarioWebRepository
                .findByNombreUsuarioIgnoreCaseOrEmailIgnoreCase(usuario, usuario)
                .orElseThrow(() -> new BusinessException("Credenciales inválidas."));

        if (!Boolean.TRUE.equals(entity.getActivo())) {
            throw new BusinessException("Usuario desactivado. Contacte al administrador.");
        }

        if (!passwordEncoder.matches(request.getContrasena(), entity.getContrasenaHash())) {
            throw new BusinessException("Credenciales inválidas.");
        }

        Map<String, Boolean> permisos = resolverPermisosEfectivos(entity);

        if (permisos.isEmpty() && entity.getModoPermisos() == ModoPermisoUsuarioWeb.ROL
                && "admin".equalsIgnoreCase(entity.getRolClave())) {
            log.warn("Rol admin con permisos vacíos al iniciar sesión. Reparando automáticamente.");
            rolWebRepository.findByClaveIgnoreCase("admin").ifPresent(rol -> {
                rol.setPermisosJson(ALL_PERMS_JSON);
                rol.setActivo(true);
                rolWebRepository.save(rol);
            });
            permisos = parsePermisosJson(ALL_PERMS_JSON);
        }

        String rolNombre = entity.getModoPermisos() == ModoPermisoUsuarioWeb.ROL && entity.getRolClave() != null
                ? rolWebRepository.findByClaveIgnoreCase(entity.getRolClave())
                        .map(RolWeb::getNombre)
                        .orElse(entity.getRolClave())
                : "Personalizado";

        WebUserDetails userDetails = new WebUserDetails(
                entity.getId().toString(),
                entity.getNombreUsuario(),
                "",
                entity.getNombreCompleto(),
                entity.getEmail(),
                rolNombre,
                permisos,
                entity.getActivo()
        );

        String token = jwtTokenProvider.crearToken(userDetails);

        sesionActivaRepository.deleteAll();
        SesionActiva sesion = new SesionActiva();
        sesion.setUsuarioId(entity.getId());
        sesion.setToken(token);
        sesion.setIniciadaEn(Instant.now());
        sesionActivaRepository.save(sesion);

        entity.setUltimaConexion(LocalDateTime.now());
        usuarioWebRepository.save(entity);

        LoginResponse response = new LoginResponse();
        response.setToken(token);

        LoginResponse.UsuarioLoginDto dto = new LoginResponse.UsuarioLoginDto();
        dto.setId(entity.getId().toString());
        dto.setNombreCompleto(entity.getNombreCompleto());
        dto.setNombreUsuario(entity.getNombreUsuario());
        dto.setEmail(entity.getEmail());
        dto.setRolNombre(rolNombre);
        dto.setPermissions(permisos);
        response.setUsuario(dto);

        log.info("Login exitoso usuario={}", entity.getNombreUsuario());
        return response;
    }

    private Map<String, Boolean> resolverPermisosEfectivos(UsuarioWeb usuario) {
        if (usuario.getModoPermisos() == ModoPermisoUsuarioWeb.ROL) {
            String clave = usuario.getRolClave();
            if (clave != null) {
                RolWeb rol = rolWebRepository.findByClaveIgnoreCase(clave).orElse(null);
                if (rol != null && Boolean.TRUE.equals(rol.getActivo())) {
                    return parsePermisosJson(rol.getPermisosJson());
                }
            }
            return new HashMap<>();
        }
        return parsePermisosJson(usuario.getPermisosJson());
    }

    private RolPermisos resolverRolYPermisosJson(
            ModoPermisoUsuarioWeb modo, String roleKeyRaw, Map<String, Boolean> permisosMap) {
        if (modo == ModoPermisoUsuarioWeb.ROL) {
            String rk = roleKeyRaw == null ? "" : roleKeyRaw.trim();
            if (rk.isEmpty()) {
                throw new BusinessException("Selecciona un rol de usuario.");
            }
            RolWeb rol = rolWebRepository
                    .findByClaveIgnoreCase(rk)
                    .orElseThrow(() -> new BusinessException("Rol no reconocido."));
            if (!Boolean.TRUE.equals(rol.getActivo())) {
                throw new BusinessException("El rol está desactivado. Elige otro rol o activa este rol.");
            }
            return new RolPermisos(rol.getClave().toLowerCase(Locale.ROOT), PERMISOS_VACIOS);
        }
        return new RolPermisos(null, serializarPermisos(permisosMap));
    }

    private Map<String, String> indexarNombresRol() {
        return rolWebRepository.findAll().stream()
                .collect(Collectors.toMap(
                        r -> r.getClave().toLowerCase(Locale.ROOT), RolWeb::getNombre, (a, b) -> a));
    }

    private static ResourceIdResponse idResponse(UUID id) {
        ResourceIdResponse dto = new ResourceIdResponse();
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
        d.setPermissions(resolverPermisosEfectivos(u));
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

    private WebUserListItemResponse toListItem(UsuarioWeb u, Map<String, String> nombrePorClave) {
        WebUserListItemResponse dto = new WebUserListItemResponse();
        dto.setId(u.getId().toString());
        dto.setNombreCompleto(u.getNombreCompleto());
        dto.setNombreUsuario(u.getNombreUsuario());
        dto.setEstado(Boolean.TRUE.equals(u.getActivo()) ? "Activo" : "Inactivo");
        dto.setRolPermisos(etiquetaRolPermisos(u, nombrePorClave));
        dto.setUltimaConexion(formatearUltimaConexion(u.getUltimaConexion()));
        return dto;
    }

    private static String etiquetaRolPermisos(UsuarioWeb u, Map<String, String> nombrePorClave) {
        if (u.getModoPermisos() == ModoPermisoUsuarioWeb.PERSONALIZADO) {
            return "Personalizado";
        }
        String rk = u.getRolClave();
        if (rk == null) {
            return "-";
        }
        return nombrePorClave.getOrDefault(rk.toLowerCase(Locale.ROOT), rk);
    }

    private static String formatearUltimaConexion(LocalDateTime t) {
        if (t == null) {
            return "-";
        }
        return t.format(ULTIMA_CONEX_UI) + " hrs";
    }
}
