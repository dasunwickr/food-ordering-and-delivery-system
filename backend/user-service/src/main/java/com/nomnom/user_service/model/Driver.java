package com.nomnom.user_service.model;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Driver extends User {
    private String vehicleType;
    private String vehicleNumber;
    private Boolean availabilityStatus;
    private List<String> assignedOrders;
}
