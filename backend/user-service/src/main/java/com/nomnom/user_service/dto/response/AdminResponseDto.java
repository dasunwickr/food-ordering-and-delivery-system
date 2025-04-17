package com.nomnom.user_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AdminResponseDto extends BaseUserResponseDto {
    private String superAdminId;
}
