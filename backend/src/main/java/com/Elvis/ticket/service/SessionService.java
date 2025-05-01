package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Transactional
    public Session createSession(Session session) {
        session.setStartTime(LocalDateTime.now());
        session.setLastActivity(LocalDateTime.now());
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Session> getSessionById(Long id) {
        return sessionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Session> getSessionsByUserId(Long userId) {
        return sessionRepository.findByUserId(userId);
    }

    @Transactional
    public Session updateLastActivity(Long id) {
        return sessionRepository.findById(id)
                .map(session -> {
                    session.setLastActivity(LocalDateTime.now());
                    return sessionRepository.save(session);
                })
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    @Transactional
    public Session endSession(Long id) {
        return sessionRepository.findById(id)
                .map(session -> {
                    session.setEndTime(LocalDateTime.now());
                    return sessionRepository.save(session);
                })
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    @Transactional
    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Session> getActiveSessions() {
        return sessionRepository.findByEndTimeIsNull();
    }

    @Transactional(readOnly = true)
    public Session getSessionBySessionId(String sessionId) {
        try {
            Long id = Long.parseLong(sessionId);
            return sessionRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Transactional
    public Session updateSession(Session session) {
        if (!sessionRepository.existsById(session.getId())) {
            throw new RuntimeException("Session not found");
        }
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<Session> getInactiveSessions(LocalDateTime threshold) {
        return sessionRepository.findByLastActivityBefore(threshold);
    }
} 