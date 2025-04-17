package com.nomnom.user_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DriverResponseDto extends BaseUserResponseDto {
    private String vehicleType;
    private String vehicleNumber;
    private Boolean availabilityStatus;
}
