package com.nomnom.session_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "sessions")
public class Session {
    private String sessionId;
    private String userId;
    private String deviceInfo;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
