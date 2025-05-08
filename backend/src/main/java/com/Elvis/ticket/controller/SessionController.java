package com.Elvis.ticket.controller;

import com.Elvis.ticket.dto.SessionResponse;
import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.service.SessionService;
import com.Elvis.ticket.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import com.Elvis.ticket.model.User;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService sessionService;
    private final UserService userService;

    @Autowired
    public SessionController(SessionService sessionService, UserService userService) {
        this.sessionService = sessionService;
        this.userService = userService;
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
} 