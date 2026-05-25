package com.promssac.backend.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderResponse {

    private String id;
    private String status;
    private String substatus;
    private String vehiclePlate;
    private String clientName;

    private String clientId;
    private String routeDate;
    private String contactName;
    private String contactIdentifier;
    private String startDate;
    private String endDate;
    private String createdAtIso;

    @JsonProperty("isLastDispatch")
    private Boolean lastDispatch;

    private String routeId;
    private String routeCode;
    private String routeName;

    private String vehicleId;

    private String driverName;
    private String driverPhone;

    private String contactPhone;
    private String contactEmail;
    private String addressLine;
    private String normalizedAddress;
    private Double latitude;
    private Double longitude;
    private Integer serviceMinutes;
    private String addressReference;
    private String deliveryWindowFrom;
    private String deliveryWindowTo;
    private String deliveryMode;
    private String deliveryPriority;
    private Boolean cashOnDelivery;
    private Map<String, String> customFields;

    private String clientAddress;
    private Double clientLatitude;
    private Double clientLongitude;
    private String clientCodigoModular;
    private String clientNivelEducacion;
    private String clientDirectorName;
    private String clientPhone;
    private String clientEmail;

    private List<OrderProductLineResponse> productLines;
}
