package com.promssac.backend.model.dto.response;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RouteResponse {

    private UUID id;

    private String code;
    private String name;
    private String vehicleId;
    private String vehiclePlate;
    private String mobileUser;
    private Integer dispatchCompleted;
    private Integer dispatchTotal;
    private String deliveryDate;
    private String createdAt;
    private String priority;
    private BigDecimal currentCollection;
    private BigDecimal totalCollection;
    private BigDecimal amountInRoute;
    private String status;
    private String place;
}
