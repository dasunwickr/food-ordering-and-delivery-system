package com.nomnom.session_service.controller;

import com.nomnom.session_service.dto.request.CreateSessionRequest;
import com.nomnom.session_service.model.Session;
import com.nomnom.session_service.service.ISessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {
    private final ISessionService sessionService;

    @PostMapping
    public ResponseEntity<Session> createSession(@RequestBody @Validated CreateSessionRequest request) {
        Session session = sessionService.createSession(request.getUserId(), request.getDeviceInfo());
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Session> getSession(@PathVariable String userId) {
        List<Session> sessions = sessionService.listSessions(userId);
        return ResponseEntity.ok(sessions.get(0));
    }

    @DeleteMapping("/{userId}/{sessionId}")
    public ResponseEntity<Void> revokeSession(@PathVariable String userId, @PathVariable String sessionId) {
        sessionService.revokeSession(sessionId, userId);
        return ResponseEntity.noContent().build();
    }

    public ResponseEntity<Void> revokeAllSessions(@PathVariable String userId) {
        sessionService.revokeAllSessions(userId);
        return ResponseEntity.noContent().build();
    }
}
