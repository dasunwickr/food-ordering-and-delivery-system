package com.nomnom.user_service.dto;


import lombok.Data;

@Data
public class AdminDTO extends UserDTO {
    private String roleType;
}
