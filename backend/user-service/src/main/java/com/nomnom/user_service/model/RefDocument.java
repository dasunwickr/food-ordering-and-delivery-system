package com.nomnom.user_service.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefDocument {

    @NotBlank(message = "Document name is required")
    private String name;

    private String description;

    @NotBlank(message = "Document URL is required")
    private String url;
}
