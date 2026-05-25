package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.RouteOrderBulkImportRequest;
import com.promssac.backend.model.dto.request.RouteWriteRequest;
import com.promssac.backend.model.dto.response.RouteContextOrderResponse;
import com.promssac.backend.model.dto.response.RouteOrderBulkImportResponse;
import com.promssac.backend.model.dto.response.RouteResponse;
import com.promssac.backend.model.entity.Cliente;
import com.promssac.backend.model.entity.Orden;
import com.promssac.backend.model.entity.OrdenProducto;
import com.promssac.backend.model.entity.Ruta;
import com.promssac.backend.model.entity.UsuarioMovil;
import com.promssac.backend.model.entity.Vehiculo;
import com.promssac.backend.repository.ClienteRepository;
import com.promssac.backend.repository.OrdenProductoRepository;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.repository.RutaRepository;
import com.promssac.backend.repository.UsuarioMovilRepository;
import com.promssac.backend.repository.VehiculoRepository;
import com.promssac.backend.service.RutaService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class RutaServiceImpl implements RutaService {

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final DateTimeFormatter UI_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter UI_DATETIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final String PRIORIDAD_DEFECTO = "medium";
    private static final String ESTADO_DEFECTO = "scheduled";

    private final RutaRepository rutaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final UsuarioMovilRepository usuarioMovilRepository;
    private final OrdenRepository ordenRepository;
    private final OrdenProductoRepository ordenProductoRepository;
    private final ClienteRepository clienteRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RouteResponse> listarParaOperaciones() {
        return rutaRepository.findAllWithVehiculo().stream().map(this::toRouteResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RouteResponse obtener(UUID id) {
        Ruta r = rutaRepository
                .findWithVehiculoById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ruta", id));
        RouteResponse response = toRouteResponse(r);

        List<RouteContextOrderResponse> orders = ordenRepository.findLiteByRutaId(id).stream().map(row -> {
            RouteContextOrderResponse dto = new RouteContextOrderResponse();
            dto.setId((String) row[0]);
            dto.setStatus((String) row[1]);
            dto.setSubstatus((String) row[2]);
            dto.setVehiclePlate((String) row[3]);
            dto.setClientName((String) row[4]);
            dto.setContactName((String) row[5]);
            dto.setContactIdentifier((String) row[6]);
            dto.setContactPhone((String) row[7]);
            dto.setDriverName((String) row[8]);
            dto.setAddressLine((String) row[9]);
            dto.setRouteDate(row[10] != null ? ((java.time.LocalDate) row[10]).format(UI_DATE) : null);
            return dto;
        }).toList();
        response.setOrders(orders);

        return response;
    }

    @Override
    @Transactional
    public RouteResponse crear(RouteWriteRequest request) {
        String codigo = resolverCodigoCrear(request.getCodigo());
        Vehiculo vehiculo = vehiculoRepository
                .findById(request.getVehiculoId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo", request.getVehiculoId()));

        Ruta r = new Ruta();
        r.setCodigo(codigo);
        aplicarCampos(r, request, vehiculo);
        r.setCreadoEn(Instant.now());

        return toRouteResponse(rutaRepository.save(r));
    }

    @Override
    @Transactional
    public RouteResponse actualizar(UUID id, RouteWriteRequest request) {
        Ruta r = rutaRepository
                .findWithVehiculoById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ruta", id));
        Vehiculo vehiculo = vehiculoRepository
                .findById(request.getVehiculoId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo", request.getVehiculoId()));

        if (StringUtils.hasText(request.getCodigo()) && !request.getCodigo().equalsIgnoreCase(r.getCodigo())) {
            rutaRepository.findByCodigo(request.getCodigo()).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw new BusinessException("Ya existe otra ruta con el código: " + request.getCodigo());
                }
            });
            r.setCodigo(request.getCodigo().trim());
        }

        aplicarCampos(r, request, vehiculo);
        return toRouteResponse(rutaRepository.save(r));
    }

    @Override
    @Transactional
    public void eliminar(UUID id) {
        Ruta r = rutaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ruta", id));
        if (ordenRepository.countByRuta_Id(id) > 0) {
            throw new BusinessException("No se puede eliminar la ruta porque tiene órdenes asociadas.");
        }
        rutaRepository.delete(r);
    }

    @Override
    @Transactional
    public RouteOrderBulkImportResponse importarLote(RouteOrderBulkImportRequest request) {
        RouteOrderBulkImportResponse response = new RouteOrderBulkImportResponse();

        Map<String, Vehiculo> placaCache = new LinkedHashMap<>();
        Map<String, String> rutaErrores = new LinkedHashMap<>();

        for (RouteOrderBulkImportRequest.Item item : request.getItems()) {
            String codigoRuta = item.getCodigoRuta().trim();
            String placaRaw = item.getPlacaVehiculo().trim().toUpperCase();

            if (!placaCache.containsKey(placaRaw)) {
                String limpia = placaRaw.replaceAll("[^A-Z0-9]", "");
                Optional<Vehiculo> v = vehiculoRepository.findByPlaca(placaRaw);
                if (v.isEmpty()) v = vehiculoRepository.findByPlaca(limpia);
                if (v.isEmpty()) {
                    v = vehiculoRepository.findAll().stream()
                            .filter(veh -> veh.getPlaca() != null && veh.getPlaca().replaceAll("[^A-Za-z0-9]", "").equalsIgnoreCase(limpia))
                            .findFirst();
                }
                if (v.isEmpty()) {
                    rutaErrores.put(codigoRuta, "Placa no encontrada: " + item.getPlacaVehiculo());
                    placaCache.put(placaRaw, null);
                } else {
                    placaCache.put(placaRaw, v.get());
                }
            }
            if (placaCache.get(placaRaw) == null) continue;

            try {
                LocalDate.parse(item.getFechaInicio());
            } catch (DateTimeParseException e) {
                rutaErrores.putIfAbsent(codigoRuta, "Fecha inválida: " + item.getFechaInicio());
                continue;
            }

            if (rutaRepository.findByCodigo(codigoRuta).isPresent()) {
                rutaErrores.putIfAbsent(codigoRuta, "Ruta ya existe: " + codigoRuta);
                continue;
            }

            if (ordenRepository.findByNumeroOrden(item.getNumeroOrden().trim()).isPresent()) {
                rutaErrores.putIfAbsent(codigoRuta, "Orden duplicada: " + item.getNumeroOrden());
            }
        }

        rutaErrores.forEach((ruta, err) -> response.getErrores().add("Ruta " + ruta + ": " + err));

        Map<String, Ruta> rutasCreadas = new LinkedHashMap<>();
        Set<String> ordenesCreadas = new HashSet<>();

        for (RouteOrderBulkImportRequest.Item item : request.getItems()) {
            String codigoRuta = item.getCodigoRuta().trim();
            if (rutaErrores.containsKey(codigoRuta)) continue;
            Vehiculo vehiculo = placaCache.get(item.getPlacaVehiculo().trim().toUpperCase());
            LocalDate fechaInicio = LocalDate.parse(item.getFechaInicio());

            Ruta ruta = rutasCreadas.computeIfAbsent(codigoRuta, codigo -> {
                Ruta r = new Ruta();
                r.setCodigo(codigo);
                r.setNombre(item.getNombreRuta().trim());
                r.setVehiculo(vehiculo);
                r.setFechaEntrega(fechaInicio);
                if (item.getFechaFin() != null && !item.getFechaFin().isBlank()) {
                    try { r.setFechaFin(LocalDate.parse(item.getFechaFin().trim())); }
                    catch (DateTimeParseException ignored) {}
                }
                r.setPrioridad(PRIORIDAD_DEFECTO);
                r.setEstado(ESTADO_DEFECTO);
                r.setCreadoEn(Instant.now());
                r.setDespachosCompletados(0);
                r.setDespachosTotales(0);
                r.setCobroActual(BigDecimal.ZERO);
                r.setCobroTotal(BigDecimal.ZERO);
                r.setMontoEnRuta(BigDecimal.ZERO);

                List<UsuarioMovil> conductores = usuarioMovilRepository.findByVehiculoPlacaWithVehiculo(vehiculo.getPlaca());
                if (!conductores.isEmpty()) {
                    r.setConductorMovil(conductores.get(0).getNombreCompleto());
                } else if (vehiculo.getConductor() != null && !vehiculo.getConductor().isBlank()) {
                    r.setConductorMovil(vehiculo.getConductor().trim());
                }

                rutaRepository.save(r);
                response.setRutasCreadas(response.getRutasCreadas() + 1);
                return r;
            });

            if (ordenesCreadas.contains(item.getNumeroOrden().trim())) {
                if (item.getProductoCodigo() != null && !item.getProductoCodigo().isBlank()) {
                    Orden ordenExistente = ordenRepository.findByNumeroOrden(item.getNumeroOrden().trim()).get();
                    OrdenProducto prod = new OrdenProducto();
                    prod.setOrden(ordenExistente);
                    prod.setCodigo(item.getProductoCodigo().trim());
                    prod.setNombre(item.getProductoNombre() != null ? item.getProductoNombre().trim() : "");
                    prod.setCantidad(item.getProductoCantidad() != null ? item.getProductoCantidad() : 1);
                    prod.setPrecioUnitario(item.getProductoPrecioUnit() != null ? item.getProductoPrecioUnit() : BigDecimal.ZERO);
                    prod.setPesoKg(item.getProductoPesoKg());
                    prod.setCampoPersonalizado(trimToNull(item.getProductoCampoExtra()));
                    ordenProductoRepository.save(prod);
                    response.setProductosCreados(response.getProductosCreados() + 1);
                }
                continue;
            }
            ordenesCreadas.add(item.getNumeroOrden().trim());

            Orden orden = new Orden();
            orden.setNumeroOrden(item.getNumeroOrden().trim());
            orden.setRuta(ruta);
            orden.setVehiculo(vehiculo);
            orden.setVehiculoPlaca(vehiculo.getPlaca());
            orden.setFechaRuta(fechaInicio);
            orden.setEstado(item.getEstadoOrden() != null && !item.getEstadoOrden().isBlank()
                    ? item.getEstadoOrden().trim() : "pending");
            orden.setSubestado(trimToNull(item.getSubestado()));
            orden.setContactoNombre(item.getContactoNombre().trim());
            orden.setContactoIdentificador(trimToNull(item.getContactoIdentificador()));
            orden.setContactoTelefono(item.getContactoTelefono().trim());
            orden.setContactoEmail(trimToNull(item.getContactoEmail()));
            orden.setDireccionLinea(trimToNull(item.getDireccion()));
            orden.setDireccionNormalizada(trimToNull(item.getDireccionNormalizada()));
            orden.setModoEntrega(trimToNull(item.getModoEntrega()));
            orden.setPrioridadEntrega(trimToNull(item.getPrioridadEntrega()));
            orden.setCreadoEn(Instant.now());
            orden.setActualizadoEn(Instant.now());
            orden.setEsUltimoDespacho(false);

            vincularCliente(item, orden, response);
            buildCamposPersonalizados(item, orden);

            ordenRepository.save(orden);
            response.setOrdenesCreadas(response.getOrdenesCreadas() + 1);

            if (item.getProductoCodigo() != null && !item.getProductoCodigo().isBlank()) {
                OrdenProducto prod = new OrdenProducto();
                prod.setOrden(orden);
                prod.setCodigo(item.getProductoCodigo().trim());
                prod.setNombre(item.getProductoNombre() != null ? item.getProductoNombre().trim() : "");
                prod.setCantidad(item.getProductoCantidad() != null ? item.getProductoCantidad() : 1);
                prod.setPrecioUnitario(item.getProductoPrecioUnit() != null ? item.getProductoPrecioUnit() : BigDecimal.ZERO);
                prod.setPesoKg(item.getProductoPesoKg());
                prod.setCampoPersonalizado(trimToNull(item.getProductoCampoExtra()));
                ordenProductoRepository.save(prod);
                response.setProductosCreados(response.getProductosCreados() + 1);
            }
        }

        return response;
    }

    private void buildCamposPersonalizados(RouteOrderBulkImportRequest.Item item, Orden orden) {
        if (item.getDirector() != null || item.getTelefonoDirector() != null
                || item.getPaquetes() != null || item.getActaEntrega() != null
                || item.getGuiaRemision() != null || item.getGuiaTransportista() != null
                || item.getCorreoElectronico() != null
                || item.getNivel() != null) {
            StringBuilder json = new StringBuilder("{");
            appendJson(json, "director", item.getDirector());
            appendJson(json, "telefono_director", item.getTelefonoDirector());
            appendJson(json, "paquetes", item.getPaquetes());
            appendJson(json, "actaEntrega", item.getActaEntrega());
            appendJson(json, "guiaRemision", item.getGuiaRemision());
            appendJson(json, "guiaTransportista", item.getGuiaTransportista());
            appendJson(json, "correoElectronico", item.getCorreoElectronico());
            appendJson(json, "nivel", item.getNivel());
            if (json.charAt(json.length() - 1) == ',') json.setLength(json.length() - 1);
            json.append("}");
            orden.setCamposPersonalizadosJson(json.toString());
        }
    }

    private void vincularCliente(RouteOrderBulkImportRequest.Item item, Orden orden, RouteOrderBulkImportResponse response) {
        if (item.getDireccion() == null || item.getDireccion().isBlank()) return;
        String codigoIE = extraerNombreIE(item.getDireccion());
        if (codigoIE == null) return;
        String nivel = item.getNivel() != null && !item.getNivel().isBlank() ? item.getNivel().trim() : null;
        Optional<Cliente> match;
        if (nivel != null) {
            match = clienteRepository.findByCodigoModularIieeAndNivel(codigoIE, nivel);
        } else {
            match = clienteRepository.findByCodigoModularIiee(codigoIE);
        }
        if (match.isPresent()) {
            Cliente c = match.get();
            orden.setCliente(c);
            response.getMensajes().add("Orden " + item.getNumeroOrden() + " vinculada a IIEE: " + c.getNombre() + (nivel != null ? " (" + nivel + ")" : ""));

            if ((item.getDirector() == null || item.getDirector().isBlank())
                    && c.getNombreApellidosDirectorIiee() != null && !c.getNombreApellidosDirectorIiee().isBlank()) {
                item.setDirector(c.getNombreApellidosDirectorIiee().trim());
            }
            if ((item.getTelefonoDirector() == null || item.getTelefonoDirector().isBlank())
                    && c.getTelefono() != null && !c.getTelefono().isBlank()) {
                item.setTelefonoDirector(c.getTelefono().trim());
            }
            if ((item.getCorreoElectronico() == null || item.getCorreoElectronico().isBlank())
                    && c.getEmail() != null && !c.getEmail().isBlank()) {
                item.setCorreoElectronico(c.getEmail().trim());
            }
            if ((item.getContactoEmail() == null || item.getContactoEmail().isBlank())
                    && c.getEmail() != null && !c.getEmail().isBlank()) {
                item.setContactoEmail(c.getEmail().trim());
                orden.setContactoEmail(c.getEmail().trim());
            }
        } else {
            response.getMensajes().add("Orden " + item.getNumeroOrden() + ": no se encontró IIEE con código " + codigoIE + (nivel != null ? " y nivel " + nivel : ""));
        }
    }

    private void appendJson(StringBuilder sb, String key, String value) {
        if (value != null && !value.isBlank()) {
            sb.append("\"").append(key).append("\":\"").append(value.trim()).append("\",");
        }
    }

    private String extraerNombreIE(String direccion) {
        if (direccion == null) return null;
        String d = direccion.trim();
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(?i)(?:IE|I\\.E\\.?|Instituci[oó]n\\s+Educativa)\\s*(?:No\\.?|N°|Nro\\.?|#)?\\s*(\\d+)").matcher(d);
        if (m.find()) return m.group(1);
        int comma = d.indexOf(',');
        if (comma > 5) return d.substring(0, comma).trim();
        return null;
    }

    private String trimToNull(String s) {
        return s != null && !s.isBlank() ? s.trim() : null;
    }

    private String resolverCodigoCrear(String solicitado) {
        if (StringUtils.hasText(solicitado)) {
            String c = solicitado.trim();
            if (c.length() > 32) throw new BusinessException("El código de ruta no puede superar 32 caracteres.");
            rutaRepository.findByCodigo(c).ifPresent(r -> {
                throw new BusinessException("Ya existe una ruta con el código: " + c);
            });
            return c;
        }
        for (int i = 0; i < 16; i++) {
            String candidate = "R" + UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase();
            if (rutaRepository.findByCodigo(candidate).isEmpty()) return candidate;
        }
        throw new BusinessException("No se pudo generar un código de ruta único.");
    }

    private void aplicarCampos(Ruta r, RouteWriteRequest request, Vehiculo vehiculo) {
        r.setNombre(request.getNombre().trim());
        r.setVehiculo(vehiculo);
        r.setFechaEntrega(request.getFechaEntrega());
        r.setPrioridad(StringUtils.hasText(request.getPrioridad()) ? request.getPrioridad().trim() : PRIORIDAD_DEFECTO);
        r.setEstado(StringUtils.hasText(request.getEstado()) ? request.getEstado().trim() : ESTADO_DEFECTO);
        r.setLugar(StringUtils.hasText(request.getLugar()) ? request.getLugar().trim() : null);
        r.setConductorMovil(resolverConductorMovil(request.getUsuarioMovilId()));
        r.setDespachosCompletados(coalesce(request.getDespachosCompletados(), r.getDespachosCompletados(), 0));
        r.setDespachosTotales(coalesce(request.getDespachosTotales(), r.getDespachosTotales(), 0));
        r.setCobroActual(coalesceMoney(request.getCobroActual(), r.getCobroActual()));
        r.setCobroTotal(coalesceMoney(request.getCobroTotal(), r.getCobroTotal()));
        r.setMontoEnRuta(coalesceMoney(request.getMontoEnRuta(), r.getMontoEnRuta()));
    }

    private static int coalesce(Integer incoming, Integer existing, int defaultIfBothNull) {
        if (incoming != null) return incoming;
        return existing != null ? existing : defaultIfBothNull;
    }

    private static BigDecimal coalesceMoney(BigDecimal incoming, BigDecimal existing) {
        if (incoming != null) return incoming;
        return existing != null ? existing : BigDecimal.ZERO;
    }

    private String resolverConductorMovil(UUID usuarioMovilId) {
        if (usuarioMovilId == null) return null;
        Optional<UsuarioMovil> u = usuarioMovilRepository.findById(usuarioMovilId);
        if (u.isEmpty()) throw new ResourceNotFoundException("Usuario móvil", usuarioMovilId);
        return u.get().getNombreCompleto();
    }

    private RouteResponse toRouteResponse(Ruta r) {
        RouteResponse dto = new RouteResponse();
        dto.setId(r.getId());
        dto.setCode(r.getCodigo());
        dto.setName(r.getNombre());
        dto.setVehicleId(r.getVehiculo().getId().toString());
        dto.setVehiclePlate(r.getVehiculo().getPlaca());
        dto.setMobileUser(r.getConductorMovil() == null ? "" : r.getConductorMovil());
        dto.setDispatchCompleted(r.getDespachosCompletados());
        dto.setDispatchTotal(r.getDespachosTotales());
        dto.setDeliveryDate(r.getFechaEntrega().format(UI_DATE));
        dto.setCreatedAt(r.getCreadoEn().atZone(LIMA).format(UI_DATETIME));
        dto.setPriority(r.getPrioridad());
        dto.setCurrentCollection(r.getCobroActual());
        dto.setTotalCollection(r.getCobroTotal());
        dto.setAmountInRoute(r.getMontoEnRuta());
        dto.setStatus(r.getEstado());
        dto.setPlace(r.getLugar() == null ? "" : r.getLugar());
        return dto;
    }
}
