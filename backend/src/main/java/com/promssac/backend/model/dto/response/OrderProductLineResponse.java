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
public class OrderProductLineResponse {

    private String id;
    private String code;
    /** Mismo valor que el número de orden en UI. */
    private String orderId;
    private String name;
    private double unitPrice;
    private int quantity;
    /** Kilogramos (solo si hay valor persistido). */
    private Double weight;
    private String customField;
    /** Texto legible para la tabla (dd/MM/yyyy HH:mm). */
    private String createdAt;
}
