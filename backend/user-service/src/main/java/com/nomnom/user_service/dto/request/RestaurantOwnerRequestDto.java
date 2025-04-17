package com.nomnom.user_service.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RestaurantOwnerRequestDto extends BaseUserRequestDto {
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantLicenseNumber;
    private List<RestaurantDocumentRequestDto> restaurantDocuments;
}
