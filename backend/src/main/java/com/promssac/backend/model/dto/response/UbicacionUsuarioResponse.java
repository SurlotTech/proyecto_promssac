package com.promssac.backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UbicacionUsuarioResponse {

    private String userId;
    private String userName;
    private double lat;
    private double lng;
    private String lastSeenIso;
}
