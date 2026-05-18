package com.promssac.backend.service.impl;

import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.model.entity.AlertaConfig;
import com.promssac.backend.repository.AlertaConfigRepository;
import com.promssac.backend.service.AlertaConfigService;
import java.time.Instant;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlertaConfigServiceImpl implements AlertaConfigService {

    private final AlertaConfigRepository repository;

    private AlertaConfig obtenerOSembrar() {
        return repository.findFirstByOrderByActualizadoEnDesc()
                .orElseGet(() -> repository.save(new AlertaConfig()));
    }

    @Override
    @Transactional(readOnly = true)
    public AlertaConfig obtener() {
        return obtenerOSembrar();
    }

    @Override
    @Transactional
    public AlertaConfig actualizar(Map<String, Object> body) {
        AlertaConfig config = obtenerOSembrar();

        if (body.containsKey("alertaEntregado") && body.get("alertaEntregado") instanceof Boolean b) {
            config.setAlertaEntregado(b);
        }
        if (body.containsKey("alertaDemora") && body.get("alertaDemora") instanceof Boolean b) {
            config.setAlertaDemora(b);
        }
        if (body.containsKey("demoraMinutos") && body.get("demoraMinutos") instanceof Number n) {
            int val = n.intValue();
            if (val < 1 || val > 1440) {
                throw new BusinessException("demoraMinutos debe estar entre 1 y 1440.");
            }
            config.setDemoraMinutos(val);
        }
        config.setActualizadoEn(Instant.now());
        return repository.save(config);
    }
}
