package com.promssac.backend.controller;

import com.promssac.backend.model.dto.response.FleetDeviceResponse;
import com.promssac.backend.service.FlotaService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/flota")
@RequiredArgsConstructor
public class FlotaController {

    private final FlotaService flotaService;

    @GetMapping("/dispositivos")
    public ResponseEntity<List<FleetDeviceResponse>> dispositivos() {
        return ResponseEntity.ok(flotaService.listarDispositivos());
    }

    @GetMapping("/dispositivos/onway-map")
    public ResponseEntity<List<FleetDeviceResponse>> dispositivosOnWayMapa() {
        return ResponseEntity.ok(flotaService.listarDispositivosOnWayMapa());
    }
}
