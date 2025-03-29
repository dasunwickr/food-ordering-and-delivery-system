package com.nomnom.session_service.service;

import com.nomnom.session_service.model.Session;
import com.nomnom.session_service.repository.SessionMongoRepository;
import com.nomnom.session_service.repository.SessionRedisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class SessionService implements ISessionService {

    private final SessionMongoRepository sessionMongoRepository;
    private final SessionRedisRepository sessionRedisRepository;

    @Override
    public Session createSession(String userId, String deviceInfo) {
        return null;
    }

    @Override
    public List<Session> listSessions(String userId) {
        return List.of();
    }

    @Override
    public void revokeSession(String userId, String sessionId) {

    }

    @Override
    public void revokeAllSessions(String userId) {

    }
}
