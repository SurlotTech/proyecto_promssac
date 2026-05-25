package com.promssac.backend.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(Include.NON_NULL)
public class AlertOrderResponse {

    private String id;
    private String status;
    private String substatus;
    private String vehiclePlate;
    private String routeDate;
    private String createdAt;
}
