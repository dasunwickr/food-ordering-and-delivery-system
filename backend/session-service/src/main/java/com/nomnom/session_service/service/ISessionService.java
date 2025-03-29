package com.nomnom.session_service.service;

import com.nomnom.session_service.model.Session;

import java.util.List;

public interface ISessionService {

    Session createSession(String userId, String deviceInfo);

    List<Session> listSessions(String userId);

    void revokeSession(String userId, String sessionId);

    void revokeAllSessions(String userId);
}