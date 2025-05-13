package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.model.SessionStatus;
import com.Elvis.ticket.repository.SessionRepository;
import com.Elvis.ticket.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class SessionService {

    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public Session createSession(Session session) {
        logger.info("Attempting to create session for user ID: {}", session.getUser() != null ? session.getUser().getId() : null);
        // Validate user exists
        User user = userRepository.findById(session.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Set initial values
        session.setUser(user);
        session.setStartTime(LocalDateTime.now());
        session.setLastActivity(LocalDateTime.now());
        session.setStatus(SessionStatus.ACTIVE);
        // Title is set by controller if provided
        // Generate conversation file path if not provided
        if (session.getConversationFilePath() == null) {
            session.setConversationFilePath(generateConversationFilePath(session));
        }
        
        // Initialize empty history with a default message
        try {
            List<Map<String, String>> initialHistory = new ArrayList<>();
            Map<String, String> welcomeMessage = new HashMap<>();
            welcomeMessage.put("role", "assistant");
            welcomeMessage.put("content", "Welcome to TechCare Support! How can I help you today?");
            welcomeMessage.put("timestamp", LocalDateTime.now().toString());
            initialHistory.add(welcomeMessage);
            
            session.setHistory(objectMapper.writeValueAsString(initialHistory));
            logger.info("Initialized session history: {}", session.getHistory());
        } catch (JsonProcessingException e) {
            logger.error("Failed to initialize session history", e);
            throw new RuntimeException("Failed to initialize session history", e);
        }
        
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
        
        // Update last activity
        session.setLastActivity(LocalDateTime.now());
        
        return sessionRepository.save(session);
    }

    @Transactional
    public Session closeSession(Long id) {
        return sessionRepository.findById(id)
                .map(session -> {
                    session.setEndTime(LocalDateTime.now());
                    session.setStatus(SessionStatus.CLOSED);
                    session.setLastActivity(LocalDateTime.now());
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

    @Transactional(readOnly = true)
    public List<Session> getInactiveSessions(LocalDateTime threshold) {
        return sessionRepository.findByLastActivityBefore(threshold);
    }

    @Transactional
    public void updateLastActivity(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setLastActivity(LocalDateTime.now());
        sessionRepository.save(session);
    }

    @Transactional
    public Session endSession(Long id) {
        return closeSession(id);
    }

    @Transactional
    public Session addMessageToHistory(Long sessionId, String role, String content) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        try {
            List<Map<String, String>> history;
            if (session.getHistory() != null && !session.getHistory().isEmpty()) {
                history = objectMapper.readValue(session.getHistory(), new TypeReference<List<Map<String, String>>>() {});
            } else {
                history = new ArrayList<>();
            }
            
            Map<String, String> newMessage = new HashMap<>();
            newMessage.put("role", role);
            newMessage.put("content", content);
            newMessage.put("timestamp", LocalDateTime.now().toString());
            history.add(newMessage);
            
            session.setHistory(objectMapper.writeValueAsString(history));
            session.setLastActivity(LocalDateTime.now());
            
            logger.info("Added message to session {} history: {}", sessionId, content);
            return sessionRepository.save(session);
        } catch (JsonProcessingException e) {
            logger.error("Failed to update session history", e);
            throw new RuntimeException("Failed to update session history", e);
        }
    }

    private String generateConversationFilePath(Session session) {
        return String.format("conversations/session_%d_%s.json", 
            session.getId(), 
            LocalDateTime.now().toString().replace(":", "-"));
    }

    @Transactional
    public Session updateSessionTitleOnly(Long id, String newTitle) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setTitle(newTitle);
        return sessionRepository.save(session);
    }
} 