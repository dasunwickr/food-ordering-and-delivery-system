package com.nomnom.user_service.model;

import lombok.*;
import org.springframework.data.geo.Point;
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
    private String vehicleTypeId;
    private String vehicleNumber;
    private int deliveryStatus;
    private List<DocumentInfo> vehicleDocuments;
    private String driverStatus;
    private Point currentLocation;
}
