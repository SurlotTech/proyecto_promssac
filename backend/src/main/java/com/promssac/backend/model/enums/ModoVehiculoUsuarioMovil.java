package com.promssac.backend.model.enums;

import com.promssac.backend.exception.BusinessException;

public enum ModoVehiculoUsuarioMovil {
    LIST("list"),
    CREATE("create");

    private final String apiValue;

    ModoVehiculoUsuarioMovil(String apiValue) {
        this.apiValue = apiValue;
    }

    public String getApiValue() {
        return apiValue;
    }

    public static ModoVehiculoUsuarioMovil fromApi(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BusinessException("Modo de vehículo inválido.");
        }
        String s = raw.trim().toLowerCase();
        for (ModoVehiculoUsuarioMovil m : values()) {
            if (m.apiValue.equals(s)) {
                return m;
            }
        }
        throw new BusinessException("Modo de vehículo no reconocido: " + raw);
    }
}
