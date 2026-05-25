package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RouteContextOrderResponse {

    private String id;
    private String status;
    private String substatus;
    private String vehiclePlate;
    private String clientName;
    private String contactName;
    private String contactIdentifier;
    private String contactPhone;
    private String driverName;
    private String addressLine;
    private String routeDate;
}
