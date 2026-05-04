package com.promssac.backend.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
}
