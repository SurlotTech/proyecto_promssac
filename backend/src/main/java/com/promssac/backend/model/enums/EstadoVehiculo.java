package com.promssac.backend.model.enums;

import com.promssac.backend.exception.BusinessException;

public enum EstadoVehiculo {
    ACTIVO("active"),
    EN_RUTA("in_route"),
    MANTENIMIENTO("maintenance"),
    INACTIVO("inactive");

    private final String apiKey;

    EstadoVehiculo(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiKey() {
        return apiKey;
    }

    public static EstadoVehiculo fromApiKey(String frontend) {
        if (frontend == null || frontend.isBlank()) {
            throw new BusinessException("Estado inválido.");
        }
        String f = frontend.trim();
        for (EstadoVehiculo e : values()) {
            if (e.apiKey.equals(f)) {
                return e;
            }
        }
        throw new BusinessException("Estado no reconocido: " + frontend);
    }
}
