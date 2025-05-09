package com.nomnom.user_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cuisine_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuisineType {
    @Id
    private String id;
    private String name;
}
