package com.promssac.backend.service.impl;

import com.promssac.backend.model.dto.request.UbicacionUsuarioRequest;
import com.promssac.backend.model.dto.response.UbicacionUsuarioResponse;
import com.promssac.backend.model.entity.UbicacionUsuario;
import com.promssac.backend.repository.UbicacionUsuarioRepository;
import com.promssac.backend.security.CurrentUserProvider;
import com.promssac.backend.security.WebUserDetails;
import com.promssac.backend.service.GpsService;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GpsServiceImpl implements GpsService {

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final DateTimeFormatter ISO_FMT = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    private static final long TTL_SECONDS = 120;

    private final UbicacionUsuarioRepository repository;
    private final CurrentUserProvider currentUserProvider;

    @Override
    @Transactional
    public void registrarUbicacion(UbicacionUsuarioRequest request) {
        currentUserProvider.currentUser().ifPresent(user -> guardarUbicacion(user, request));
    }

    private void guardarUbicacion(WebUserDetails user, UbicacionUsuarioRequest request) {
        UbicacionUsuario u = repository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UbicacionUsuario n = new UbicacionUsuario();
                    n.setUserId(user.getId());
                    n.setUserName(user.getNombreCompleto());
                    return n;
                });
        u.setLat(request.getLat());
        u.setLng(request.getLng());
        u.setUltimoEnvio(Instant.now());
        repository.save(u);
    }

    @Override
    public List<UbicacionUsuarioResponse> listarUbicaciones() {
        Instant threshold = Instant.now().minusSeconds(TTL_SECONDS);
        return repository.findByUltimoEnvioAfter(threshold).stream()
                .map(u -> new UbicacionUsuarioResponse(
                        u.getUserId(),
                        u.getUserName(),
                        u.getLat(),
                        u.getLng(),
                        ISO_FMT.format(u.getUltimoEnvio().atZone(LIMA))))
                .toList();
    }

    @Override
    @Transactional
    public void eliminarUbicacionActual() {
        currentUserProvider.currentUser()
                .map(WebUserDetails::getId)
                .ifPresent(repository::deleteByUserId);
    }
}
