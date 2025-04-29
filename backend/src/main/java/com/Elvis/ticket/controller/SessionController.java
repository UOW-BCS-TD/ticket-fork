package com.Elvis.ticket.controller;

import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService sessionService;

    @Autowired
    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public List<Session> getAllSessions() {
        return sessionService.getAllSessions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Session> getSessionById(@PathVariable Long id) {
        return sessionService.getSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Session> getSessionBySessionId(@PathVariable String sessionId) {
        Session session = sessionService.getSessionBySessionId(sessionId);
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public List<Session> getSessionsByUserId(@PathVariable Long userId) {
        return sessionService.getSessionsByUserId(userId);
    }

    @PostMapping
    public Session createSession(@RequestBody Session session) {
        return sessionService.createSession(session);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Session> updateSession(@PathVariable Long id, @RequestBody Session session) {
        try {
            Session updatedSession = sessionService.updateSession(session);
            return ResponseEntity.ok(updatedSession);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/activity")
    public ResponseEntity<Void> updateLastActivity(@PathVariable Long id) {
        sessionService.updateLastActivity(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inactive")
    public List<Session> getInactiveSessions(@RequestParam LocalDateTime threshold) {
        return sessionService.getInactiveSessions(threshold);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok().build();
    }
} 