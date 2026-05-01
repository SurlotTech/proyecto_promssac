package com.promssac.backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FleetDeviceResponse {

    private String id;
    private String plate;
    private String imei;
    private double lat;
    private double lng;
    private String status;
    private Integer batteryPct;
    private Integer signalBars;
    private String lastSeenIso;
    /** Nombre corto / alias OnWay (puede ser null si no viene o está vacío). */
    private String alias;
    /** Velocidad instantánea en km/h (puede ser null si no aplica). */
    private Double speedKmh;
}
