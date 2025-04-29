package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {
    private final SessionRepository sessionRepository;

    @Autowired
    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    public Optional<Session> getSessionById(Long id) {
        return sessionRepository.findById(id);
    }

    public Session getSessionBySessionId(String sessionId) {
        return sessionRepository.findBySessionId(sessionId);
    }

    public List<Session> getSessionsByUserId(Long userId) {
        return sessionRepository.findByUserId(userId);
    }

    public Session createSession(Session session) {
        return sessionRepository.save(session);
    }

    public Session updateSession(Session session) {
        return sessionRepository.save(session);
    }

    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    public void updateLastActivity(Long id) {
        sessionRepository.findById(id).ifPresent(session -> {
            session.setLastActivity(LocalDateTime.now());
            sessionRepository.save(session);
        });
    }

    public List<Session> getInactiveSessions(LocalDateTime threshold) {
        return sessionRepository.findByLastActivityBefore(threshold);
    }
} 