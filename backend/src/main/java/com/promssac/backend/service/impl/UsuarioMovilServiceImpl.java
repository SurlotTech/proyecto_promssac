package com.promssac.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.MobileUserCreateRequest;
import com.promssac.backend.model.dto.request.MobileUserUpdateRequest;
import com.promssac.backend.model.dto.request.VehicleWriteRequest;
import com.promssac.backend.model.dto.response.MobileUserDetailResponse;
import com.promssac.backend.model.dto.response.MobileUserListItemResponse;
import com.promssac.backend.model.dto.response.MobileUserPhotoPayload;
import com.promssac.backend.model.dto.response.MobileUserRouteOptionResponse;
import com.promssac.backend.model.dto.response.MobileUserResponse;
import com.promssac.backend.model.dto.response.VehicleResponse;
import com.promssac.backend.model.entity.UsuarioMovil;
import com.promssac.backend.model.entity.Vehiculo;
import com.promssac.backend.model.enums.ModoVehiculoUsuarioMovil;
import com.promssac.backend.repository.UsuarioMovilRepository;
import com.promssac.backend.repository.VehiculoRepository;
import com.promssac.backend.service.UsuarioMovilService;
import com.promssac.backend.service.VehiculoService;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class UsuarioMovilServiceImpl implements UsuarioMovilService {

    private static final DateTimeFormatter CREATED_UI = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter LIST_DATE = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final long MAX_FOTO_BYTES = 10L * 1024 * 1024;
    private static final Set<String> TIPOS_IMAGEN_PERMITIDOS =
            Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final List<String> EXTENSIONES_FOTO = List.of(".jpg", ".png", ".webp", ".gif");
    private static final String MSG_USUARIO_DUPLICADO = "Ya existe un usuario móvil con ese nombre de usuario.";
    private static final String MSG_PERMISOS_SERIALIZAR = "No se pudo serializar los permisos.";
    private static final String MSG_PERMISOS_INVALIDOS = "Permisos almacenados inválidos.";

    private final UsuarioMovilRepository usuarioMovilRepository;
    private final VehiculoRepository vehiculoRepository;
    private final VehiculoService vehiculoService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Value("${app.mobile-user-photo-dir:data/usuarios-movil-fotos}")
    private String mobileUserPhotoDir;

    @Override
    @Transactional(readOnly = true)
    public List<MobileUserListItemResponse> listar(boolean incluirInactivos) {
        List<UsuarioMovil> usuarios = incluirInactivos
                ? usuarioMovilRepository.findAllWithVehiculoOrderByCreadoEnDesc()
                : usuarioMovilRepository.findAllActivoWithVehiculoOrderByCreadoEnDesc();
        return usuarios.stream()
                .map(this::toListItem)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MobileUserRouteOptionResponse> listarOpcionesParaRutas() {
        return usuarioMovilRepository.findAllWithVehiculoOrderByCreadoEnDesc().stream()
                .filter(u -> Boolean.TRUE.equals(u.getActivo()))
                .map(this::toRouteOption)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MobileUserDetailResponse obtenerDetalle(UUID id) {
        UsuarioMovil u = usuarioMovilRepository
                .findWithVehiculoById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario móvil", id));
        return toDetalleResponse(u);
    }

    @Override
    @Transactional
    public MobileUserResponse crear(MobileUserCreateRequest request, MultipartFile foto) {
        validarFotoSiPresente(foto);
        String usuario = request.getNombreUsuario().trim();
        if (usuarioMovilRepository.existsByNombreUsuarioIgnoreCase(usuario)) {
            throw new BusinessException(MSG_USUARIO_DUPLICADO);
        }

        ModoVehiculoUsuarioMovil modo = ModoVehiculoUsuarioMovil.fromApi(request.getVehicleMode());
        Vehiculo vehiculo = resolverYCargarVehiculo(
                modo,
                request.getVehicleId(),
                request.getCreateVehicleType(),
                request.getCreateVehicleName(),
                request.getNombreCompleto().trim());
        String permisosJson = serializarPermisos(request.getPermissions());

        UsuarioMovil entity = new UsuarioMovil();
        entity.setNombreCompleto(request.getNombreCompleto().trim());
        entity.setNombreUsuario(usuario);
        entity.setContrasenaHash(passwordEncoder.encode(request.getContrasena()));
        entity.setActivo(true);
        aplicarCamposPerfilYVehiculo(entity, request.getTelefono(), request.getFotoAprobada(), modo, vehiculo, permisosJson);

        UsuarioMovil guardado = usuarioMovilRepository.save(entity);
        persistirFotoOpcional(guardado, foto);
        log.info(
                "Usuario móvil creado id={} usuario={} vehiculoId={} foto={}",
                guardado.getId(),
                guardado.getNombreUsuario(),
                vehiculo.getId(),
                guardado.getFotoContentType() != null);
        return toResponse(guardado, vehiculo);
    }

    @Override
    @Transactional
    public MobileUserResponse actualizar(UUID id, MobileUserUpdateRequest request, MultipartFile foto) {
        validarFotoSiPresente(foto);
        UsuarioMovil entity = usuarioMovilRepository
                .findWithVehiculoById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario móvil", id));

        String usuario = request.getNombreUsuario().trim();
        if (usuarioMovilRepository.existsByNombreUsuarioIgnoreCaseAndIdNot(usuario, id)) {
            throw new BusinessException(MSG_USUARIO_DUPLICADO);
        }

        String pinOpcional = request.getContrasena();
        if (pinOpcional != null && !pinOpcional.isBlank() && !pinOpcional.matches("\\d{4}")) {
            throw new BusinessException("La contraseña debe tener exactamente 4 dígitos.");
        }

        ModoVehiculoUsuarioMovil modo = ModoVehiculoUsuarioMovil.fromApi(request.getVehicleMode());
        Vehiculo vehiculo = resolverYCargarVehiculo(
                modo,
                request.getVehicleId(),
                request.getCreateVehicleType(),
                request.getCreateVehicleName(),
                request.getNombreCompleto().trim());
        String permisosJson = serializarPermisos(request.getPermissions());

        entity.setNombreCompleto(request.getNombreCompleto().trim());
        entity.setNombreUsuario(usuario);
        if (pinOpcional != null && !pinOpcional.isBlank()) {
            entity.setContrasenaHash(passwordEncoder.encode(pinOpcional));
        }
        aplicarCamposPerfilYVehiculo(entity, request.getTelefono(), request.getFotoAprobada(), modo, vehiculo, permisosJson);

        UsuarioMovil guardado = usuarioMovilRepository.save(entity);
        persistirFotoOpcional(guardado, foto);
        log.info("Usuario móvil actualizado id={} usuario={}", guardado.getId(), guardado.getNombreUsuario());
        return toResponse(guardado, vehiculo);
    }

    @Override
    @Transactional
    public void setActivo(UUID id, boolean activo) {
        UsuarioMovil u = usuarioMovilRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario móvil", id));
        u.setActivo(activo);
        usuarioMovilRepository.save(u);
        log.info("Usuario móvil id={} activo={}", id, activo);
    }

    @Override
    @Transactional(readOnly = true)
    public MobileUserPhotoPayload obtenerFoto(UUID usuarioMovilId) {
        UsuarioMovil u = usuarioMovilRepository
                .findById(usuarioMovilId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario móvil", usuarioMovilId));
        String ct = u.getFotoContentType();
        if (ct == null || ct.isBlank()) {
            throw new ResourceNotFoundException("Foto de usuario móvil", usuarioMovilId);
        }
        Path path = resolverRutaFoto(u.getId(), ct);
        if (!Files.isRegularFile(path)) {
            throw new ResourceNotFoundException("Foto de usuario móvil", usuarioMovilId);
        }
        try {
            return new MobileUserPhotoPayload(Files.readAllBytes(path), ctPrincipal(ct));
        } catch (IOException e) {
            log.error("No se pudo leer foto usuarioMovilId={}", usuarioMovilId, e);
            throw new BusinessException("No se pudo leer la foto del usuario.");
        }
    }

    private void validarFotoSiPresente(MultipartFile foto) {
        if (foto != null && !foto.isEmpty()) {
            validarArchivoFoto(foto);
        }
    }

    private void persistirFotoOpcional(UsuarioMovil usuario, MultipartFile foto) {
        if (foto != null && !foto.isEmpty()) {
            persistirFotoEnDisco(usuario, foto);
        }
    }

    private Vehiculo resolverYCargarVehiculo(
            ModoVehiculoUsuarioMovil modo,
            String vehicleId,
            String createTipo,
            String createNombre,
            String nombreCompletoTrim) {
        UUID vehiculoId = resolverVehiculoId(modo, vehicleId, createTipo, createNombre, nombreCompletoTrim);
        return vehiculoRepository
                .findById(vehiculoId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo", vehiculoId));
    }

    private String serializarPermisos(Map<String, Boolean> permissions) {
        try {
            return objectMapper.writeValueAsString(permissions);
        } catch (JsonProcessingException e) {
            throw new BusinessException(MSG_PERMISOS_SERIALIZAR);
        }
    }

    private void aplicarCamposPerfilYVehiculo(
            UsuarioMovil entity,
            String telefono,
            Boolean fotoAprobada,
            ModoVehiculoUsuarioMovil modo,
            Vehiculo vehiculo,
            String permisosJson) {
        entity.setTelefono(blankToNull(telefono));
        entity.setFotoAprobada(Boolean.TRUE.equals(fotoAprobada));
        entity.setModoVehiculo(modo);
        entity.setVehiculo(vehiculo);
        entity.setPermisosJson(permisosJson);
    }

    private void validarArchivoFoto(MultipartFile foto) {
        if (foto.getSize() > MAX_FOTO_BYTES) {
            throw new BusinessException("La imagen no puede superar 10 MB.");
        }
        String ct = ctPrincipal(foto.getContentType());
        if (!TIPOS_IMAGEN_PERMITIDOS.contains(ct)) {
            throw new BusinessException("Solo se permiten imágenes JPEG, PNG, WebP o GIF.");
        }
    }

    private void persistirFotoEnDisco(UsuarioMovil usuario, MultipartFile foto) {
        borrarFotosAnteriores(usuario.getId());
        String ct = ctPrincipal(foto.getContentType());
        Path destino = resolverRutaFoto(usuario.getId(), ct);
        try {
            Path root = destino.getParent();
            if (root != null) {
                Files.createDirectories(root);
            }
            try (InputStream in = foto.getInputStream()) {
                Files.copy(in, destino, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            log.error("Error guardando foto usuario id={}", usuario.getId(), e);
            throw new BusinessException("No se pudo guardar la foto del usuario.");
        }
        usuario.setFotoContentType(ct);
        usuarioMovilRepository.save(usuario);
    }

    private Path resolverRutaFoto(UUID id, String contentTypeRaw) {
        String ct = ctPrincipal(contentTypeRaw);
        String ext = extensionParaContentType(ct);
        Path root = Paths.get(mobileUserPhotoDir).toAbsolutePath().normalize();
        Path dest = root.resolve(id.toString() + ext).normalize();
        if (!dest.startsWith(root)) {
            throw new BusinessException("Ruta de almacenamiento inválida.");
        }
        return dest;
    }

    private static String ctPrincipal(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        return raw.split(";")[0].trim().toLowerCase(Locale.ROOT);
    }

    private static String extensionParaContentType(String ct) {
        return switch (ct) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> throw new BusinessException("Tipo de imagen no permitido.");
        };
    }

    private UUID resolverVehiculoId(
            ModoVehiculoUsuarioMovil modo,
            String vehicleId,
            String createTipo,
            String createNombre,
            String nombreCompletoTrim) {
        if (modo == ModoVehiculoUsuarioMovil.LIST) {
            if (vehicleId == null || vehicleId.isBlank()) {
                throw new BusinessException("Selecciona un vehículo de la lista.");
            }
            try {
                UUID vid = UUID.fromString(vehicleId.trim());
                if (!vehiculoRepository.existsById(vid)) {
                    throw new ResourceNotFoundException("Vehículo", vid);
                }
                return vid;
            } catch (IllegalArgumentException ex) {
                throw new BusinessException("Identificador de vehículo inválido.");
            }
        }

        if (createTipo == null || createTipo.isBlank()) {
            throw new BusinessException("Indica el tipo de vehículo a crear.");
        }
        if (createNombre == null || createNombre.isBlank()) {
            throw new BusinessException("Indica la placa del vehículo a crear.");
        }

        String placa = createNombre.trim().toUpperCase(Locale.ROOT);
        if (vehiculoRepository.existsByPlaca(placa)) {
            throw new BusinessException("Ya existe un vehículo con la placa «" + placa + "».");
        }

        VehicleWriteRequest v = new VehicleWriteRequest();
        v.setPlate(placa);
        v.setType(createTipo.trim());
        v.setGroup("General");
        v.setDriver(nombreCompletoTrim);
        v.setStatus("active");
        v.setCapacityKg(1500);
        v.setLoadPct(0);
        v.setLastService(null);
        v.setAutoManaged(false);

        VehicleResponse creado = vehiculoService.crear(v);
        return UUID.fromString(creado.getId());
    }

    private void borrarFotosAnteriores(UUID userId) {
        Path root = Paths.get(mobileUserPhotoDir).toAbsolutePath().normalize();
        if (!Files.isDirectory(root)) {
            return;
        }
        String base = userId.toString();
        for (String ext : EXTENSIONES_FOTO) {
            try {
                Path p = root.resolve(base + ext).normalize();
                if (p.startsWith(root)) {
                    Files.deleteIfExists(p);
                }
            } catch (IOException ex) {
                log.warn("No se pudo borrar posible foto anterior id={} ext={}", base, ext);
            }
        }
    }

    private Map<String, Boolean> parsePermisosJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Boolean>>() {});
        } catch (JsonProcessingException e) {
            throw new BusinessException(MSG_PERMISOS_INVALIDOS);
        }
    }

    private static String urlFotoRelativa(UUID usuarioId) {
        return "/api/v1/usuarios-movil/" + usuarioId + "/foto";
    }

    private MobileUserDetailResponse toDetalleResponse(UsuarioMovil u) {
        MobileUserDetailResponse d = new MobileUserDetailResponse();
        d.setId(u.getId().toString());
        d.setNombreCompleto(u.getNombreCompleto());
        d.setNombreUsuario(u.getNombreUsuario());
        d.setTelefono(u.getTelefono() == null ? "" : u.getTelefono());
        d.setFotoAprobada(Boolean.TRUE.equals(u.getFotoAprobada()));
        d.setVehicleMode(u.getModoVehiculo().getApiValue());
        d.setVehicleId(u.getVehiculo().getId().toString());
        if (u.getModoVehiculo() == ModoVehiculoUsuarioMovil.CREATE) {
            d.setCreateVehicleType(u.getVehiculo().getTipo().getApiLabel());
            d.setCreateVehicleName(u.getVehiculo().getPlaca());
        } else {
            d.setCreateVehicleType("");
            d.setCreateVehicleName("");
        }
        d.setPermissions(parsePermisosJson(u.getPermisosJson()));
        String ct = u.getFotoContentType();
        d.setFotoUrl(ct != null && !ct.isBlank() ? urlFotoRelativa(u.getId()) : "");
        return d;
    }

    private String nuevaPlacaUnica() {
        for (int i = 0; i < 40; i++) {
            String p = ("UM" + UUID.randomUUID().toString().replace("-", "")).toUpperCase(Locale.ROOT);
            if (p.length() > 20) {
                p = p.substring(0, 20);
            }
            if (!vehiculoRepository.existsByPlaca(p)) {
                return p;
            }
        }
        throw new BusinessException("No se pudo generar una placa única para el vehículo nuevo.");
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private MobileUserRouteOptionResponse toRouteOption(UsuarioMovil u) {
        MobileUserRouteOptionResponse dto = new MobileUserRouteOptionResponse();
        dto.setId(u.getId().toString());
        dto.setNombreCompleto(u.getNombreCompleto());
        dto.setVehiculoId(u.getVehiculo().getId().toString());
        return dto;
    }

    private MobileUserListItemResponse toListItem(UsuarioMovil u) {
        MobileUserListItemResponse dto = new MobileUserListItemResponse();
        dto.setId(u.getId().toString());
        dto.setNombreCompleto(u.getNombreCompleto());
        dto.setNombreUsuario(u.getNombreUsuario());
        dto.setEstado(Boolean.TRUE.equals(u.getActivo()) ? "Activo" : "Inactivo");
        dto.setTipoUsuario("Usuario móvil");
        dto.setVehiculoTipo(u.getVehiculo().getTipo().getApiLabel());
        dto.setVehiculoAsignado(u.getVehiculo().getPlaca());
        LocalDateTime c = u.getCreadoEn();
        dto.setFechaCreacion(c == null ? "" : c.format(LIST_DATE));
        if (c != null) {
            long days = ChronoUnit.DAYS.between(c.toLocalDate(), LocalDate.now());
            dto.setDiasActivo((int) Math.max(0, days));
        } else {
            dto.setDiasActivo(0);
        }
        return dto;
    }

    private static MobileUserResponse toResponse(UsuarioMovil u, Vehiculo vehiculo) {
        MobileUserResponse dto = new MobileUserResponse();
        dto.setId(u.getId().toString());
        dto.setNombreCompleto(u.getNombreCompleto());
        dto.setNombreUsuario(u.getNombreUsuario());
        dto.setVehiculoId(vehiculo.getId().toString());
        dto.setVehiculoPlaca(vehiculo.getPlaca());
        LocalDateTime c = u.getCreadoEn();
        dto.setCreadoEn(c == null ? "" : c.format(CREATED_UI));
        String ct = u.getFotoContentType();
        dto.setFotoUrl(ct != null && !ct.isBlank() ? urlFotoRelativa(u.getId()) : "");
        return dto;
    }
}
