package com.nomnom.user_service.model;

import com.nomnom.user_service.enums.DriverStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Driver extends User {
    @NotBlank(message = "Vehicle type ID cannot be blank")
    private String vehicleTypeId;
    @NotBlank(message = "Vehicle number cannot be blank")
    private String vehicleNumber;
    @NotBlank(message = "Registered address cannot be blank")
    private String registeredAddress;

    @NotNull(message = "Current location is required")
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private Point currentLocation;

    @Valid
    private List<RefDocument> driverDocuments;

    @NotNull(message = "Driver status is required")
    private DriverStatus status;

}
