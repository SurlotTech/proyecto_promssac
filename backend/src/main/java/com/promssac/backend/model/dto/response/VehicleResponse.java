package com.promssac.backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {

    private String id;
    private String plate;
    private String type;
    private String group;
    private String driver;
    private String status;
    private Integer capacityKg;
    private Integer loadPct;
    private String lastService;
    private String createdAt;
    private Boolean autoManaged;
}
