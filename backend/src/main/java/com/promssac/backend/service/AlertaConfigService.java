package com.promssac.backend.service;

import com.promssac.backend.model.entity.AlertaConfig;
import java.util.Map;

public interface AlertaConfigService {
    AlertaConfig obtener();
    AlertaConfig actualizar(Map<String, Object> body);
}
