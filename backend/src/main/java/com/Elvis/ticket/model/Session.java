package com.Elvis.ticket.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId;

    @Column(nullable = false)
    private String category;

    @Column(name = "conversation_history", columnDefinition = "TEXT")
    private String conversationHistory;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_activity")
    private LocalDateTime lastActivity = LocalDateTime.now();
} 