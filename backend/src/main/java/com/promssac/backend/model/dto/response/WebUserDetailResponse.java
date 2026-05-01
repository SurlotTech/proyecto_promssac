package com.promssac.backend.model.dto.response;

import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WebUserDetailResponse {

    private String id;
    private String nombreCompleto;
    private String nombreUsuario;
    private String email;
    private String permissionMode;
    private String roleKey;
    private Map<String, Boolean> permissions;
}
