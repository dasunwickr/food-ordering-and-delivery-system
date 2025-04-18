package com.nomnom.user_service.model;


import com.nomnom.user_service.enums.RestaurantStatus;
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
public class Restaurant extends User {
    @NotBlank(message = "Restaurant name is required")
    private String restaurantName;

    @NotBlank(message = "Restaurant license number is required")
    private String restaurantLicenseNumber;

    @NotBlank(message = "Restaurant address is required")
    private String restaurantAddress;

    @NotNull(message = "Restaurant location is required")
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private Point restaurantLocation;

    @Valid
    private List<@Valid RefDocument> restaurantDocuments;

    @NotBlank(message = "Restaurant type ID is required")
    private String restaurantTypeId;

    @NotNull(message = "Cuisine type IDs are required")
    private List<String> cuisineTypeIds;

    @NotNull(message = "Tags are required")
    private List<String> tags;

    @NotNull(message = "Restaurant status is required")
    private RestaurantStatus status;

}
