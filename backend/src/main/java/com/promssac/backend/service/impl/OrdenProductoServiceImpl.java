package com.promssac.backend.service.impl;

import com.promssac.backend.exception.ResourceNotFoundException;
import com.promssac.backend.model.dto.request.OrderProductLineCreateRequest;
import com.promssac.backend.model.dto.response.OrderProductLineResponse;
import com.promssac.backend.model.entity.Orden;
import com.promssac.backend.model.entity.OrdenProducto;
import com.promssac.backend.repository.OrdenProductoRepository;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.service.OrdenProductoService;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class OrdenProductoServiceImpl implements OrdenProductoService {

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final DateTimeFormatter CREATED_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final OrdenRepository ordenRepository;
    private final OrdenProductoRepository ordenProductoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderProductLineResponse> listarPorNumeroOrden(String numeroOrden) {
        String num = numeroOrden == null ? "" : numeroOrden.trim();
        if (!ordenRepository.findByNumeroOrden(num).isPresent()) {
            throw new ResourceNotFoundException("Orden", num);
        }
        return ordenProductoRepository.findByOrden_NumeroOrdenOrderByCreadoEnAsc(num).stream()
                .map(p -> toResponse(p, num))
                .toList();
    }

    @Override
    @Transactional
    public OrderProductLineResponse agregar(String numeroOrden, OrderProductLineCreateRequest request) {
        String num = numeroOrden == null ? "" : numeroOrden.trim();
        Orden orden = ordenRepository
                .findByNumeroOrden(num)
                .orElseThrow(() -> new ResourceNotFoundException("Orden", num));

        OrdenProducto p = new OrdenProducto();
        p.setOrden(orden);
        p.setCodigo(request.getCode().trim());
        p.setNombre(request.getName().trim());
        p.setPrecioUnitario(request.getUnitPrice());
        p.setCantidad(request.getQuantity());
        p.setPesoKg(request.getWeight());
        p.setCampoPersonalizado(trimToNull(request.getCustomField()));
        p.setCreadoEn(Instant.now());

        OrdenProducto guardado = ordenProductoRepository.save(p);
        return toResponse(guardado, num);
    }

    @Override
    @Transactional
    public OrderProductLineResponse actualizar(
            String numeroOrden, UUID productoId, OrderProductLineCreateRequest request) {
        String num = numeroOrden == null ? "" : numeroOrden.trim();
        if (!ordenRepository.findByNumeroOrden(num).isPresent()) {
            throw new ResourceNotFoundException("Orden", num);
        }
        OrdenProducto p = ordenProductoRepository
                .findByIdAndOrden_NumeroOrden(productoId, num)
                .orElseThrow(() -> new ResourceNotFoundException("Producto de orden", productoId));
        p.setCodigo(request.getCode().trim());
        p.setNombre(request.getName().trim());
        p.setPrecioUnitario(request.getUnitPrice());
        p.setCantidad(request.getQuantity());
        p.setPesoKg(request.getWeight());
        p.setCampoPersonalizado(trimToNull(request.getCustomField()));
        OrdenProducto guardado = ordenProductoRepository.save(p);
        return toResponse(guardado, num);
    }

    @Override
    @Transactional
    public void eliminar(String numeroOrden, UUID productoId) {
        String num = numeroOrden == null ? "" : numeroOrden.trim();
        if (!ordenRepository.findByNumeroOrden(num).isPresent()) {
            throw new ResourceNotFoundException("Orden", num);
        }
        OrdenProducto p = ordenProductoRepository
                .findByIdAndOrden_NumeroOrden(productoId, num)
                .orElseThrow(() -> new ResourceNotFoundException("Producto de orden", productoId));
        ordenProductoRepository.delete(p);
    }

    private static String trimToNull(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        return s.trim();
    }

    private OrderProductLineResponse toResponse(OrdenProducto p, String numeroOrden) {
        OrderProductLineResponse dto = new OrderProductLineResponse();
        dto.setId(p.getId().toString());
        dto.setCode(p.getCodigo());
        dto.setOrderId(numeroOrden);
        dto.setName(p.getNombre());
        dto.setUnitPrice(p.getPrecioUnitario().doubleValue());
        dto.setQuantity(p.getCantidad());
        if (p.getPesoKg() != null) {
            dto.setWeight(p.getPesoKg().doubleValue());
        }
        dto.setCustomField(p.getCampoPersonalizado() == null || p.getCampoPersonalizado().isBlank()
                ? "—"
                : p.getCampoPersonalizado());
        dto.setCreatedAt(p.getCreadoEn().atZone(LIMA).format(CREATED_FMT));
        return dto;
    }
}
