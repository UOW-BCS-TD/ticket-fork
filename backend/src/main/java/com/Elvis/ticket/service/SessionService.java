package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.repository.SessionRepository;
import com.Elvis.ticket.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Session createSession(Session session) {
        logger.info("Attempting to create session for user ID: {}", session.getUser() != null ? session.getUser().getId() : null);
        // Validate user exists
        User user = userRepository.findById(session.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Set the validated user
        session.setUser(user);
        
        // Set timestamps
        session.setStartTime(LocalDateTime.now());
        session.setLastActivity(LocalDateTime.now());
        
        Session saved = sessionRepository.save(session);
        logger.info("Session saved with ID: {} for user ID: {}", saved.getId(), saved.getUser().getId());
        return saved;
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
        if (!sessionRepository.existsById(id)) {
            throw new RuntimeException("Session not found");
        }
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
            return sessionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid session ID format");
        }
    }

    @Transactional
    public Session updateSession(Session session) {
        if (!sessionRepository.existsById(session.getId())) {
            throw new RuntimeException("Session not found");
        }
        
        // Validate user if changed
        if (session.getUser() != null) {
            User user = userRepository.findById(session.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            session.setUser(user);
        }
        
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<Session> getInactiveSessions(LocalDateTime threshold) {
        return sessionRepository.findByLastActivityBefore(threshold);
    }
} 