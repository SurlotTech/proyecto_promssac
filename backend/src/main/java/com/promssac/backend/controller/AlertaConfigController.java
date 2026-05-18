package com.promssac.backend.controller;

import com.promssac.backend.model.entity.AlertaConfig;
import com.promssac.backend.service.AlertaConfigService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/alertas")
@RequiredArgsConstructor
public class AlertaConfigController {

    private final AlertaConfigService alertaConfigService;

    @GetMapping("/config")
    public ResponseEntity<AlertaConfig> obtener() {
        return ResponseEntity.ok(alertaConfigService.obtener());
    }

    @PutMapping("/config")
    public ResponseEntity<AlertaConfig> actualizar(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(alertaConfigService.actualizar(body));
    }
}
