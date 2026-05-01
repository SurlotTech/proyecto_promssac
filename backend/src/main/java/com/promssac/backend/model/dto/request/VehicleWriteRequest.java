package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VehicleWriteRequest {

    @NotBlank
    @Size(max = 20)
    private String plate;

    @NotBlank
    private String type;

    @NotBlank
    @Size(max = 60)
    private String group;

    @Size(max = 120)
    private String driver;

    @NotBlank
    private String status;

    @NotNull
    @Positive
    private Integer capacityKg;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer loadPct;

    private String lastService;

    @NotNull
    private Boolean autoManaged;
}
