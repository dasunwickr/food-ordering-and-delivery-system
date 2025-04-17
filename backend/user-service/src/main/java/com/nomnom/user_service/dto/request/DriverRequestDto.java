package com.nomnom.user_service.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DriverRequestDto extends BaseUserRequestDto {
    private String vehicleType;
    private String vehicleNumber;
    private Boolean availabilityStatus;
}
