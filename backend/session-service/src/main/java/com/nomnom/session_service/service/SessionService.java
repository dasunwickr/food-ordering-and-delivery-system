package com.nomnom.session_service.service;

import com.nomnom.session_service.model.Session;
import com.nomnom.session_service.repository.SessionMongoRepository;
import com.nomnom.session_service.repository.SessionRedisRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@RequiredArgsConstructor
@Service
public class SessionService implements ISessionService {

    private final SessionMongoRepository sessionMongoRepository;
    private final SessionRedisRepository sessionRedisRepository;

    @Override
    public Session createSession(String userId, String deviceInfo) {
        String sessionId = UUID.randomUUID().toString();
        Session session = new Session(
                sessionId,
                userId,
                deviceInfo,
                LocalDateTime.now(),
                LocalDateTime.now().plusDays(7)
        );

        sessionRedisRepository.save(session);
        sessionMongoRepository.save(session);

        return session;
    }

    @Override
    public List<Session> listSessions(String userId) {
        Iterable<Session> redisSession = sessionRedisRepository.findAll();
        List<Session> sessions = (List<Session>) redisSession;

        if(sessions.isEmpty()){
            sessions = sessionMongoRepository.findByUserId(userId);
        }
        return sessions;
    }

    @Override
    public void revokeSession(String userId, String sessionId) {
        sessionRedisRepository.deleteById(sessionId);
        sessionMongoRepository.deleteById(sessionId);
    }

    @Override
    public void revokeAllSessions(String userId) {
        sessionRedisRepository.deleteAll();
        sessionMongoRepository.deleteAllByUserId(userId);
    }
}
