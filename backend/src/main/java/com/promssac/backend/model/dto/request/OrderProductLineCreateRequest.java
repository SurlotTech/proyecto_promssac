package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderProductLineCreateRequest {

    @NotBlank
    @Size(max = 64)
    private String code;

    @NotBlank
    @Size(max = 400)
    private String name;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal unitPrice;

    @NotNull
    @Min(1)
    private Integer quantity;

    /** Opcional — kilogramos. */
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal weight;

    @Size(max = 300)
    private String customField;
}
