package com.nomnom.user_service.dto;

import lombok.Data;
import java.util.List;

@Data
public class DriverDTO extends UserDTO {
    private String vehicleType;
    private String vehicleNumber;
    private Boolean availabilityStatus;
    private List<String> assignedOrders;
}
