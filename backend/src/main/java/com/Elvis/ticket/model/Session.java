package com.Elvis.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "last_activity", nullable = false)
    private LocalDateTime lastActivity;

    @Column(name = "history", columnDefinition = "LONGTEXT")
    private String history;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Transient
    @JsonIgnore
    private List<ChatMessage> chatHistory;

    public static class ChatMessage {
        private String role; // "user" or "assistant"
        private String content;
        private LocalDateTime timestamp;

        public ChatMessage() {}

        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
            this.timestamp = LocalDateTime.now();
        }

        // Getters and setters
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    public void addMessage(String role, String content) {
        if (chatHistory == null) {
            chatHistory = new ArrayList<>();
        }
        chatHistory.add(new ChatMessage(role, content));
        updateHistoryJson();
    }

    private void updateHistoryJson() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.history = mapper.writeValueAsString(chatHistory);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize chat history", e);
        }
    }

    public List<ChatMessage> getChatHistory() {
        if (chatHistory == null && history != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                chatHistory = mapper.readValue(history, 
                    mapper.getTypeFactory().constructCollectionType(List.class, ChatMessage.class));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to deserialize chat history", e);
            }
        }
        return chatHistory != null ? chatHistory : new ArrayList<>();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public LocalDateTime getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }

    public String getHistory() {
        return history;
    }

    public void setHistory(String history) {
        this.history = history;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
} 