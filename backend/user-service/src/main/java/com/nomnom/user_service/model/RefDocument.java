package com.nomnom.user_service.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefDocument {
    @NotBlank
    private String name;
    private String description;
    @NotBlank
    private String url;
}
