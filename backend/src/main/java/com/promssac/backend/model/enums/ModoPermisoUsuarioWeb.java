package com.promssac.backend.model.enums;

import com.promssac.backend.exception.BusinessException;

public enum ModoPermisoUsuarioWeb {
    ROL("rol"),
    PERSONALIZADO("personalizado");

    private final String apiValue;

    ModoPermisoUsuarioWeb(String apiValue) {
        this.apiValue = apiValue;
    }

    public String getApiValue() {
        return apiValue;
    }

    public static ModoPermisoUsuarioWeb fromApi(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BusinessException("Modo de permisos inválido.");
        }
        String s = raw.trim().toLowerCase();
        for (ModoPermisoUsuarioWeb m : values()) {
            if (m.apiValue.equals(s)) {
                return m;
            }
        }
        throw new BusinessException("Modo de permisos no reconocido: " + raw);
    }
}
