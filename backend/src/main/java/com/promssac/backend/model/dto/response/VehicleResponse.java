package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VehicleResponse {

    private String id;
    private String plate;
    private String type;
    private String group;
    private String driver;
    private String driverId;
    private String status;
    private Integer capacityKg;
    private Integer loadPct;
    private String lastService;
    private String createdAt;
    private Boolean autoManaged;
}
