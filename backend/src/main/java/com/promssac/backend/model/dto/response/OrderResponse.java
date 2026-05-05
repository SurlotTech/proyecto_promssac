package com.promssac.backend.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String routeDate;
    private String contactName;
    private String contactIdentifier;
    private String routeDateIso;
    private String createdAtIso;

    @JsonProperty("isLastDispatch")
    private Boolean lastDispatch;

    /** UUID de la ruta asignada, si existe. */
    private String routeId;

    /** UUID del vehículo asignado a la orden, si existe. */
    private String vehicleId;

    /** Datos del asistente &quot;Completar orden&quot; (si ya se guardaron). */
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
}
