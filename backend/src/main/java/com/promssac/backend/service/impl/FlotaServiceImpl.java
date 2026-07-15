package com.promssac.backend.service.impl;

import com.promssac.backend.integration.orbitec.OrbitecClient;
import com.promssac.backend.model.dto.response.FleetDeviceResponse;
import com.promssac.backend.model.entity.DispositivoFlota;
import com.promssac.backend.repository.DispositivoFlotaRepository;
import com.promssac.backend.service.FlotaService;
import com.promssac.backend.time.FleetTimeZones;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FlotaServiceImpl implements FlotaService {

    private final DispositivoFlotaRepository dispositivoFlotaRepository;
    private final OrbitecClient orbitecClient;

    @Override
    @Transactional(readOnly = true)
    public List<FleetDeviceResponse> listarDispositivos() {
        return orbitecClient.tryFetchDevicesLite()
                .orElseGet(this::dispositivosDesdeBaseLocal);
    }

    private List<FleetDeviceResponse> dispositivosDesdeBaseLocal() {
        return dispositivoFlotaRepository.findAllFetched().stream().map(this::toFleetDeviceResponse).toList();
    }

    private FleetDeviceResponse toFleetDeviceResponse(DispositivoFlota d) {
        int bars = d.getBarrasSenal() == null ? 1 : Math.min(4, Math.max(1, d.getBarrasSenal()));
        String lastSeen = d.getUltimoVisto() == null
                ? Instant.now().toString()
                : d.getUltimoVisto().atZone(FleetTimeZones.AMERICA_LIMA).toOffsetDateTime().toString();
        return new FleetDeviceResponse(
                d.getId().toString(),
                d.getVehiculo().getPlaca(),
                d.getImei(),
                d.getUltimoLat() == null ? 0 : d.getUltimoLat(),
                d.getUltimoLng() == null ? 0 : d.getUltimoLng(),
                d.getEstado(),
                d.getBateriaPct() == null ? 0 : d.getBateriaPct(),
                bars,
                lastSeen,
                null,
                0.0);
    }
}
