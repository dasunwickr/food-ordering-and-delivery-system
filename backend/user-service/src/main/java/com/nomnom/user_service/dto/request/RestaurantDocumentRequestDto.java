package com.nomnom.user_service.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantDocumentRequestDto {
    private String name;
    private String url;
}
