package com.nomnom.user_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseUserResponseDto {
    private String id;
    private String firstName;
    private String lastName;
    private String address;
    private Double longitude;
    private Double latitude;
    private String email;
    private String contactNumber;
    private String username;
    private String userType;
}
