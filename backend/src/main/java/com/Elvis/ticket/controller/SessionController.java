package com.Elvis.ticket.controller;

import com.Elvis.ticket.dto.SessionResponse;
import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService sessionService;

    @Autowired
    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
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
    public SessionResponse createSession(@RequestBody Session session) {
        return SessionResponse.fromSession(sessionService.createSession(session));
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
    public ResponseEntity<SessionResponse> endSession(@PathVariable Long id) {
        try {
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