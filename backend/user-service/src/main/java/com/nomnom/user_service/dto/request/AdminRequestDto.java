package com.nomnom.user_service.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AdminRequestDto extends BaseUserRequestDto {
    private String superAdminId;
}
