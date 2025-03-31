package com.nomnom.user_service.dto;

import lombok.Data;

@Data
public class UserDTO {
    private String firstName;
    private String lastName;
    private String address;
    private Double longitude;
    private Double latitude;
    private String email;
    private String contactNumber;
    private String username;
    private String password;
}
