package com.promssac.backend.model.enums;

import com.promssac.backend.exception.BusinessException;

public enum TipoVehiculo {
    FURGON("Furgón"),
    CAMION("Camión"),
    MOTO("Moto"),
    CAMIONETA("Camioneta");

    private final String apiLabel;

    TipoVehiculo(String apiLabel) {
        this.apiLabel = apiLabel;
    }

    public String getApiLabel() {
        return apiLabel;
    }

    public static TipoVehiculo fromApiLabel(String display) {
        if (display == null || display.isBlank()) {
            throw new BusinessException("Tipo de vehículo inválido.");
        }
        String t = display.trim();
        for (TipoVehiculo v : values()) {
            if (v.apiLabel.equals(t)) {
                return v;
            }
        }
        throw new BusinessException("Tipo de vehículo no reconocido: " + display);
    }
}
