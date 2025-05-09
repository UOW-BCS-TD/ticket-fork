package com.Elvis.ticket.controller;

import com.Elvis.ticket.dto.SessionResponse;
import com.Elvis.ticket.dto.SessionHistoryResponse;
import com.Elvis.ticket.dto.SessionListResponse;
import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.service.SessionService;
import com.Elvis.ticket.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import com.Elvis.ticket.model.User;

import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService sessionService;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(SessionController.class);

    @Autowired
    public SessionController(SessionService sessionService, UserService userService) {
        this.sessionService = sessionService;
        this.userService = userService;
    }

    @GetMapping("/list")
    public ResponseEntity<List<SessionListResponse>> getSessionList(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Session> sessions;
            if ("ADMIN".equals(user.getRole()) || "MANAGER".equals(user.getRole())) {
                sessions = sessionService.getAllSessions();
            } else {
                sessions = sessionService.getSessionsByUserId(user.getId());
            }

            List<SessionListResponse> sessionList = sessions.stream()
                .map(SessionListResponse::fromSession)
                .collect(Collectors.toList());

            return ResponseEntity.ok(sessionList);
        } catch (Exception e) {
            logger.error("Error getting session list", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public List<SessionResponse> getAllSessions() {
        return sessionService.getAllSessions().stream()
                .map(SessionResponse::fromSession)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> getSessionById(@PathVariable Long id) {
        return sessionService.getSessionById(id)
                .map(SessionResponse::fromSession)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<SessionResponse> getSessionBySessionId(@PathVariable String sessionId) {
        Session session = sessionService.getSessionBySessionId(sessionId);
        return session != null ? 
            ResponseEntity.ok(SessionResponse.fromSession(session)) : 
            ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public List<SessionResponse> getSessionsByUserId(@PathVariable Long userId) {
        return sessionService.getSessionsByUserId(userId).stream()
                .map(SessionResponse::fromSession)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<SessionResponse> createSession(Authentication authentication, @RequestBody(required = false) Session sessionRequest) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email).orElse(null);
        if (user == null || !"CUSTOMER".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Session session = new Session();
        session.setUser(user);
        if (sessionRequest != null && sessionRequest.getTitle() != null) {
            session.setTitle(sessionRequest.getTitle());
        }
        // Timestamps are set in the service
        Session created = sessionService.createSession(session);
        return ResponseEntity.status(HttpStatus.CREATED).body(SessionResponse.fromSession(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionResponse> updateSession(@PathVariable Long id, @RequestBody Session session) {
        try {
            Session updatedSession = sessionService.updateSession(session);
            return ResponseEntity.ok(SessionResponse.fromSession(updatedSession));
        } catch (RuntimeException e) {
            logger.error("Error updating session", e);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/activity")
    public ResponseEntity<Void> updateLastActivity(@PathVariable Long id) {
        sessionService.updateLastActivity(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<SessionResponse> endSession(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Session session = sessionService.getSessionById(id).orElse(null);
            if (session == null) {
                return ResponseEntity.notFound().build();
            }
            // Allow if admin/manager or session owner
            boolean isAdminOrManager = "ADMIN".equals(user.getRole()) || "MANAGER".equals(user.getRole());
            boolean isSessionOwner = session.getUser().getId().equals(user.getId());
            if (!isAdminOrManager && !isSessionOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Session endedSession = sessionService.endSession(id);
            return ResponseEntity.ok(SessionResponse.fromSession(endedSession));
        } catch (RuntimeException e) {
            logger.error("Error ending session", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/inactive")
    public List<SessionResponse> getInactiveSessions(@RequestParam LocalDateTime threshold) {
        return sessionService.getInactiveSessions(threshold).stream()
                .map(SessionResponse::fromSession)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<SessionHistoryResponse> getSessionHistory(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email).orElse(null);
            if (user == null) {
                logger.error("User not found for email: {}", email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            Session session = sessionService.getSessionById(id).orElse(null);
            if (session == null) {
                logger.error("Session not found for ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            // Allow if admin/manager or session owner
            boolean isAdminOrManager = "ADMIN".equals(user.getRole()) || "MANAGER".equals(user.getRole());
            boolean isSessionOwner = session.getUser().getId().equals(user.getId());
            if (!isAdminOrManager && !isSessionOwner) {
                logger.error("User {} not authorized to access session {}", email, id);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            try {
                logger.info("Getting history for session {}: {}", id, session.getHistory());
                SessionHistoryResponse response = SessionHistoryResponse.fromSession(session);
                logger.info("Parsed history response: {}", response);
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                logger.error("Error parsing session history for session {}: {}", id, e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        } catch (RuntimeException e) {
            logger.error("Error getting session history for session {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/message")
    public ResponseEntity<SessionResponse> addMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> message,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email).orElse(null);
            if (user == null) {
                logger.error("User not found for email: {}", email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            Session session = sessionService.getSessionById(id).orElse(null);
            if (session == null) {
                logger.error("Session not found for ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            // Allow if admin/manager or session owner
            boolean isAdminOrManager = "ADMIN".equals(user.getRole()) || "MANAGER".equals(user.getRole());
            boolean isSessionOwner = session.getUser().getId().equals(user.getId());
            if (!isAdminOrManager && !isSessionOwner) {
                logger.error("User {} not authorized to access session {}", email, id);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            String role = message.get("role");
            String content = message.get("content");
            if (role == null || content == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Session updatedSession = sessionService.addMessageToHistory(id, role, content);
            return ResponseEntity.ok(SessionResponse.fromSession(updatedSession));
        } catch (RuntimeException e) {
            logger.error("Error adding message to session {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
} 