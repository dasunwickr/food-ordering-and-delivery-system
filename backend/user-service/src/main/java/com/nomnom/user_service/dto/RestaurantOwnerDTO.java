package com.nomnom.user_service.dto;


import lombok.Data;

@Data
public class RestaurantOwnerDTO extends UserDTO {
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantLicenseNumber;
    private String restaurantDocuments;
}

