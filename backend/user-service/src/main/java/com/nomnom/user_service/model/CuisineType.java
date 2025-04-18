package com.nomnom.user_service.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cuisine_types")
public class CuisineType {

    @Id
    private String id;

    @NotBlank(message = "Cuisine type name is required")
    private String name;
}
