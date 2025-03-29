package com.nomnom.session_service.service;

import com.nomnom.session_service.exception.ResourceNotFoundException;
import com.nomnom.session_service.model.Session;
import com.nomnom.session_service.repository.SessionMongoRepository;
import com.nomnom.session_service.repository.SessionRedisRepository;
import com.nomnom.session_service.util.LoggerUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
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
    private final RedisTemplate<Object, Object> redisTemplate;

    @Override
    public Session createSession(String userId, String deviceInfo) {
        LoggerUtil.info(this.getClass(), "Creating session for userId: {}", userId);

        try {
            String sessionId = UUID.randomUUID().toString();
            Session session = new Session(
                    sessionId,
                    userId,
                    deviceInfo,
                    LocalDateTime.now(),
                    LocalDateTime.now().plusDays(7)
            );

            // Save session to Redis and MongoDB
            sessionRedisRepository.save(session);
            sessionMongoRepository.save(session);

            // Set TTL in Redis for session expiration
            redisTemplate.expire(sessionId, java.time.Duration.ofDays(7));

            LoggerUtil.info(this.getClass(), "Session created successfully with sessionId: {}", sessionId);
            return session;
        } catch (Exception e) {
            LoggerUtil.error(this.getClass(), "Error while creating session for userId: {}", e, userId);
            throw e;
        }
    }

    @Override
    public List<Session> listSessions(String userId) {
        LoggerUtil.info(this.getClass(), "Listing sessions for userId: {}", userId);

        try {
            Iterable<Session> redisSessions = sessionRedisRepository.findAll();
            List<Session> sessions = new ArrayList<>();
            redisSessions.forEach(sessions::add);

            if (sessions.isEmpty()) {
                LoggerUtil.info(this.getClass(), "No sessions found in Redis. Fetching from MongoDB for userId: {}", userId);
                sessions = sessionMongoRepository.findByUserId(userId);
            }

            if (sessions.isEmpty()) {
                LoggerUtil.warn(this.getClass(), "No sessions found for userId: {}", userId);
                throw new ResourceNotFoundException("No sessions found for userId: " + userId);
            }

            return sessions;
        } catch (Exception e) {
            LoggerUtil.error(this.getClass(), "Error while listing sessions for userId: {}", e, userId);
            throw e;
        }
    }

    @Override
    public void revokeSession(String userId, String sessionId) {
        LoggerUtil.info(this.getClass(), "Revoking session with sessionId: {} for userId: {}", sessionId, userId);

        try {
            if (!sessionRedisRepository.existsById(sessionId)) {
                LoggerUtil.warn(this.getClass(), "Session not found in Redis with sessionId: {}", sessionId);
                throw new ResourceNotFoundException("Session not found with sessionId: " + sessionId);
            }

            // Delete session from Redis and MongoDB
            sessionRedisRepository.deleteById(sessionId);
            sessionMongoRepository.deleteById(sessionId);

            LoggerUtil.info(this.getClass(), "Session revoked successfully with sessionId: {}", sessionId);
        } catch (Exception e) {
            LoggerUtil.error(this.getClass(), "Error while revoking session with sessionId: {}", e, sessionId);
            throw e;
        }
    }

    @Override
    public void revokeAllSessions(String userId) {
        LoggerUtil.info(this.getClass(), "Revoking all sessions for userId: {}", userId);

        try {
            // Delete all sessions from Redis and MongoDB
            sessionRedisRepository.deleteAll();
            sessionMongoRepository.deleteAllByUserId(userId);

            LoggerUtil.info(this.getClass(), "All sessions revoked successfully for userId: {}", userId);
        } catch (Exception e) {
            LoggerUtil.error(this.getClass(), "Error while revoking all sessions for userId: {}", e, userId);
            throw e;
        }
    }
}