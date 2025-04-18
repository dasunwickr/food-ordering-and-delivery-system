package com.nomnom.user_service.model;

import com.nomnom.user_service.enums.AdminLevel;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Admin extends User {

    @NotNull(message = "Admin level is required")
    @Field("admin_level")
    private AdminLevel adminLevel;
}

