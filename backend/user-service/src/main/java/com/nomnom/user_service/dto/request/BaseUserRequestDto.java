package com.nomnom.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseUserRequestDto {
    private String firstName;
    private String lastName;
    private String Address;
    private Double longitude;
    private Double latitude;
    private String email;
    private String contactNumber;
    private String password;
}
