package com.nomnom.user_service.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vehicle_types")
public class VehicleType {
    @Id
    private String id;
    @NotBlank(message = "Vehicle type name cannot be blank")
    private String name;
    @NotBlank(message = "Description cannot be blank")
    private String description;
    @NotNull(message = "Max capacity must be specified")
    @Positive(message = "Max capacity must be a positive number")
    private Integer maxCapacity; // No. of Orders
}
