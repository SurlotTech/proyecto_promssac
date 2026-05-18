package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.ClientActivoPatchRequest;
import com.promssac.backend.model.dto.request.ClientBulkImportRequest;
import com.promssac.backend.model.dto.request.ClientWriteRequest;
import com.promssac.backend.model.dto.response.ClientBulkImportFailureResponse;
import com.promssac.backend.model.dto.response.ClientBulkImportResponse;
import com.promssac.backend.model.dto.response.ClientResponse;
import com.promssac.backend.model.dto.response.OrderResponse;
import com.promssac.backend.model.entity.Cliente;
import com.promssac.backend.repository.ClienteRepository;
import com.promssac.backend.service.ClienteService;
import com.promssac.backend.service.OrdenService;
import com.promssac.backend.validation.CorreoOpcionalValidator;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final OrdenService ordenService;
    private final PlatformTransactionManager transactionManager;

    private TransactionTemplate persistenciaImportLote;

    @PostConstruct
    void initPersistenciaImportLoteTx() {
        persistenciaImportLote = new TransactionTemplate(transactionManager);
        persistenciaImportLote.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    private static String trimToNull(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        return s.trim();
    }

    private static String trimToEmpty(String s) {
        return s == null ? "" : s.trim();
    }

    private static final int MAX_NOMBRE_CATALOGO = 200;

    private static final String SEP_CATALOGO = " · ";

    private static String clipNombreCatalogo(String s) {
        if (s == null || s.isEmpty()) {
            return "";
        }
        if (s.length() <= MAX_NOMBRE_CATALOGO) {
            return s;
        }
        return s.substring(0, MAX_NOMBRE_CATALOGO);
    }

    /**
     * Si el cuerpo trae {@code nombre} no vacío, se usa (import Excel). Si no, se arma como en la hoja regional:
     * centro · IIEE {modular} · UGEL · Cód. {regional} y opcionalmente · NIVEL.
     */
    private static String resolverNombreCatalogo(ClientWriteRequest r) {
        if (r.getNombre() != null && StringUtils.hasText(r.getNombre().trim())) {
            return clipNombreCatalogo(r.getNombre().trim());
        }
        String centro = trimToEmpty(r.getCentroPoblado());
        String iiee = trimToEmpty(r.getCodigoModularIiee());
        String ugel = trimToEmpty(r.getUgel());
        String codigo = trimToEmpty(r.getCodigoRegional());
        String nivelRaw = trimToEmpty(r.getNivelEducacion());

        List<String> partes = new ArrayList<>();
        if (StringUtils.hasText(centro)) {
            partes.add(centro);
        }
        if (StringUtils.hasText(iiee)) {
            partes.add("IIEE " + iiee);
        }
        if (StringUtils.hasText(ugel)) {
            partes.add(ugel);
        }
        if (StringUtils.hasText(codigo)) {
            partes.add("Cód. " + codigo);
        }
        String nombreSinNivel = String.join(SEP_CATALOGO, partes);
        if (!StringUtils.hasText(nombreSinNivel)) {
            return "";
        }
        if (!StringUtils.hasText(nivelRaw)) {
            return clipNombreCatalogo(nombreSinNivel);
        }
        String nivelMostrar = nivelRaw.toUpperCase(Locale.ROOT).replaceAll("\\s+", " ").trim();
        return clipNombreCatalogo(nombreSinNivel + SEP_CATALOGO + nivelMostrar);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientResponse> listarParaOperaciones(boolean incluirInactivos) {
        List<Cliente> list =
                incluirInactivos ? clienteRepository.findAllByOrderByNombreAsc()
                        : clienteRepository.findAllByActivoTrueOrderByNombreAsc();
        if (list.isEmpty()) {
            return List.of();
        }
        List<UUID> idsClientes = list.stream().map(Cliente::getId).distinct().toList();
        Map<UUID, Long> ordenPorClienteId = ordenService.contarAgrupadoPorClienteId(idsClientes);
        return list.stream().map(c -> toResponse(c, ordenPorClienteId)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClientResponse obtener(UUID id) {
        Cliente c = clienteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        return toResponse(c, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientResponse> buscarPorNombre(String query) {
        String q = (query == null ? "" : query).trim();
        if (q.isEmpty()) return List.of();
        return clienteRepository.searchByNombre(q).stream()
                .map(this::toResponseSinOrdenes)
                .toList();
    }

    @Override
    @Transactional
    public ClientResponse crear(ClientWriteRequest request) {
        String nombreNorm = resolverNombreCatalogo(request);
        if (!StringUtils.hasText(nombreNorm)) {
            throw new BusinessException(
                    "No se pudo armar el nombre del cliente: indique al menos centro poblado, IIEE, UGEL o código regional.");
        }
        if (clienteRepository.existsByNombreIgnoreCase(nombreNorm)) {
            throw new BusinessException("Ya existe un cliente con el mismo nombre.");
        }
        CorreoOpcionalValidator.assertValidoSiPresente(request.getEmail());
        Cliente saved = clienteRepository.save(construirClienteNuevo(request, Instant.now()));
        return toResponse(saved, null);
    }

    @Override
    public ClientBulkImportResponse importarEnLote(ClientBulkImportRequest request) {
        ClientBulkImportResponse out = new ClientBulkImportResponse();
        List<ClientWriteRequest> items = request.getItems();
        if (items.isEmpty()) {
            return out;
        }

        List<ClientBulkImportFailureResponse> erroresPrevios = new ArrayList<>();
        List<ClienteInsertPlan> planes = new ArrayList<>();
        Instant now = Instant.now();

        Set<String> nombresPedido = new HashSet<>();
        for (ClientWriteRequest raw : items) {
            String n = resolverNombreCatalogo(raw);
            if (StringUtils.hasText(n)) {
                nombresPedido.add(n.toLowerCase(Locale.ROOT));
            }
        }
        Set<String> ocupadosEnBd = buscarNombresExistentesEnBd(nombresPedido);

        Set<String> vistoEnEsteEnvio = new HashSet<>();
        for (int i = 0; i < items.size(); i++) {
            ClientWriteRequest row = items.get(i);
            String nombreTrim = resolverNombreCatalogo(row);
            if (!StringUtils.hasText(nombreTrim)) {
                erroresPrevios.add(
                        new ClientBulkImportFailureResponse(
                                i,
                                "",
                                "No se pudo armar el nombre del cliente (IIEE, UGEL, centro o código regional)."));
                continue;
            }
            String claveNombre = nombreTrim.toLowerCase(Locale.ROOT);
            try {
                CorreoOpcionalValidator.assertValidoSiPresente(row.getEmail());
            } catch (BusinessException be) {
                erroresPrevios.add(new ClientBulkImportFailureResponse(i, nombreTrim, be.getMessage()));
                continue;
            }
            if (vistoEnEsteEnvio.contains(claveNombre)) {
                erroresPrevios.add(
                        new ClientBulkImportFailureResponse(
                                i, nombreTrim, "Nombre duplicado dentro del mismo envío."));
                continue;
            }
            if (ocupadosEnBd.contains(claveNombre)) {
                erroresPrevios.add(
                        new ClientBulkImportFailureResponse(
                                i, nombreTrim, "Ya existe un cliente con el mismo nombre."));
                continue;
            }
            vistoEnEsteEnvio.add(claveNombre);
            planes.add(new ClienteInsertPlan(i, construirClienteNuevo(row, now)));
        }

        out.getFallos().addAll(erroresPrevios);
        if (planes.isEmpty()) {
            return out;
        }

        planes.sort(Comparator.comparingInt(ClienteInsertPlan::indiceOriginal));
        List<Cliente> entidades = planes.stream().map(ClienteInsertPlan::cliente).toList();

        try {
            persistenciaImportLote.executeWithoutResult(status -> clienteRepository.saveAll(entidades));
            for (ClienteInsertPlan plan : planes) {
                out.getCreados().add(toResponseSinOrdenes(plan.cliente));
            }
        } catch (RuntimeException ex) {
            String msg = mensajeImportacion(ex);
            for (ClienteInsertPlan plan : planes) {
                out.getFallos()
                        .add(
                                new ClientBulkImportFailureResponse(
                                        plan.indiceOriginal,
                                        plan.cliente.getNombre() == null ? "" : plan.cliente.getNombre(),
                                        msg));
            }
        }
        return out;
    }

    @Override
    @Transactional
    public ClientResponse actualizar(UUID id, ClientWriteRequest request) {
        Cliente c = clienteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        String nuevoNombre = resolverNombreCatalogo(request);
        if (!StringUtils.hasText(nuevoNombre)) {
            throw new BusinessException(
                    "No se pudo armar el nombre del cliente: indique al menos centro poblado, IIEE, UGEL o código regional.");
        }
        if (!nuevoNombre.equalsIgnoreCase(c.getNombre())
                && clienteRepository.existsByNombreIgnoreCaseAndIdNot(nuevoNombre, id)) {
            throw new BusinessException("Ya existe otro cliente con el mismo nombre.");
        }
        CorreoOpcionalValidator.assertValidoSiPresente(request.getEmail());

        aplicarEscritura(c, request, false);
        if (request.getActivo() != null) {
            c.setActivo(Boolean.TRUE.equals(request.getActivo()));
        }
        c.setActualizadoEn(Instant.now());
        return toResponse(clienteRepository.save(c), null);
    }

    @Override
    @Transactional
    public ClientResponse cambiarActivo(UUID id, ClientActivoPatchRequest body) {
        Cliente c = clienteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        c.setActivo(Boolean.TRUE.equals(body.getActivo()));
        c.setActualizadoEn(Instant.now());
        return toResponse(clienteRepository.save(c), null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> listarOrdenesRelacionadas(UUID clienteId) {
        clienteRepository.findById(clienteId).orElseThrow(() -> new ResourceNotFoundException("Cliente", clienteId));
        return ordenService.listarPorClienteId(clienteId);
    }

    private Set<String> buscarNombresExistentesEnBd(Set<String> nombresNormalizados) {
        if (nombresNormalizados.isEmpty()) {
            return Set.of();
        }
        final int maxIn = 750;
        Set<String> resultado = new HashSet<>();
        List<String> lista = new ArrayList<>(nombresNormalizados);
        for (int start = 0; start < lista.size(); start += maxIn) {
            int end = Math.min(start + maxIn, lista.size());
            resultado.addAll(clienteRepository.findNombresNormalizadosExistentesEn(lista.subList(start, end)));
        }
        return resultado;
    }

    private Cliente construirClienteNuevo(ClientWriteRequest request, Instant ahora) {
        Cliente c = new Cliente();
        aplicarEscritura(c, request, true);
        if (Boolean.FALSE.equals(request.getActivo())) {
            c.setActivo(false);
        } else if (request.getActivo() == null) {
            c.setActivo(true);
        } else {
            c.setActivo(Boolean.TRUE.equals(request.getActivo()));
        }
        c.setCreadoEn(ahora);
        c.setActualizadoEn(ahora);
        return c;
    }

    private record ClienteInsertPlan(int indiceOriginal, Cliente cliente) {}

    private static String mensajeImportacion(Throwable ex) {
        Throwable cur = ex;
        while (cur != null) {
            if (cur instanceof BusinessException be) {
                return be.getMessage();
            }
            cur = cur.getCause();
        }
        String msg = ex.getMessage();
        return StringUtils.hasText(msg) ? msg : "No se pudo crear el cliente.";
    }

    private void aplicarEscritura(Cliente c, ClientWriteRequest r, boolean nuevoRegistro) {
        c.setNombre(resolverNombreCatalogo(r));
        c.setEmail(trimToNull(r.getEmail()));
        c.setTelefono(trimToNull(r.getTelefono()));
        c.setNombreApellidosDirectorIiee(trimToNull(r.getNombreApellidosDirectorIiee()));
        c.setCodigoRegional(trimToNull(r.getCodigoRegional()));
        c.setDepartamento(trimToNull(r.getDepartamento()));
        c.setProvincia(trimToNull(r.getProvincia()));
        c.setDistrito(trimToNull(r.getDistrito()));
        c.setUgel(trimToNull(r.getUgel()));
        c.setCentroPoblado(trimToNull(r.getCentroPoblado()));
        c.setDireccion(trimToNull(r.getDireccion()));
        c.setCodigoModularIiee(trimToNull(r.getCodigoModularIiee()));
        c.setNivelEducacion(trimToNull(r.getNivelEducacion()));

        if (Boolean.TRUE.equals(r.getUbicacionMapaLimpiar())) {
            c.setLatitud(null);
            c.setLongitud(null);
        } else if (r.getLatitud() != null && r.getLongitud() != null) {
            c.setLatitud(r.getLatitud());
            c.setLongitud(r.getLongitud());
        } else if (nuevoRegistro) {
            c.setLatitud(null);
            c.setLongitud(null);
        }
    }

    private static void copiarAStringRegionCliente(ClientResponse dto, Cliente c) {
        dto.setCodigoRegional(Objects.requireNonNullElse(c.getCodigoRegional(), ""));
        dto.setDepartamento(Objects.requireNonNullElse(c.getDepartamento(), ""));
        dto.setProvincia(Objects.requireNonNullElse(c.getProvincia(), ""));
        dto.setDistrito(Objects.requireNonNullElse(c.getDistrito(), ""));
        dto.setUgel(Objects.requireNonNullElse(c.getUgel(), ""));
        dto.setCentroPoblado(Objects.requireNonNullElse(c.getCentroPoblado(), ""));
        dto.setDireccion(Objects.requireNonNullElse(c.getDireccion(), ""));
        dto.setCodigoModularIiee(Objects.requireNonNullElse(c.getCodigoModularIiee(), ""));
        dto.setNivelEducacion(Objects.requireNonNullElse(c.getNivelEducacion(), ""));
    }

    private ClientResponse toResponseSinOrdenes(Cliente c) {
        ClientResponse dto = new ClientResponse();
        rellenarDatosClienteRespuesta(dto, c);
        dto.setOrdenesTotalesRelacionadas(0L);
        return dto;
    }

    private static void rellenarDatosClienteRespuesta(ClientResponse dto, Cliente c) {
        dto.setId(c.getId().toString());
        dto.setNombre(c.getNombre());
        dto.setEmail(c.getEmail() == null ? "" : c.getEmail());
        dto.setTelefono(c.getTelefono() == null ? "" : c.getTelefono());
        dto.setNombreApellidosDirectorIiee(c.getNombreApellidosDirectorIiee() == null ? "" : c.getNombreApellidosDirectorIiee());
        copiarAStringRegionCliente(dto, c);
        dto.setLatitud(c.getLatitud() == null ? null : c.getLatitud().doubleValue());
        dto.setLongitud(c.getLongitud() == null ? null : c.getLongitud().doubleValue());
        dto.setActivo(Boolean.TRUE.equals(c.getActivo()));
    }

    private ClientResponse toResponse(Cliente c, Map<UUID, Long> ordenPorClienteId) {
        ClientResponse dto = new ClientResponse();
        rellenarDatosClienteRespuesta(dto, c);
        long ordenTotales =
                ordenPorClienteId != null
                        ? ordenPorClienteId.getOrDefault(c.getId(), 0L)
                        : ordenService.contarPorClienteId(c.getId());
        dto.setOrdenesTotalesRelacionadas(ordenTotales);
        return dto;
    }
}
