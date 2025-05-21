package com.Elvis.ticket.dto;

import lombok.Data;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SessionHistoryResponse {
    private Long sessionId;
    private List<Message> messages;

    @Data
    public static class Message {
        private String role;
        private String content;
        private String timestamp;
    }

    public static SessionHistoryResponse fromSession(com.Elvis.ticket.model.Session session) {
        try {
            SessionHistoryResponse response = new SessionHistoryResponse();
            response.setSessionId(session.getId());
            
            if (session.getHistory() != null && !session.getHistory().isEmpty()) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    System.out.println("Raw history: " + session.getHistory());
                    List<Message> messages = mapper.readValue(session.getHistory(), new TypeReference<List<Message>>() {});
                    System.out.println("Parsed messages: " + messages);
                    response.setMessages(messages);
                } catch (Exception e) {
                    System.err.println("Error parsing history: " + e.getMessage());
                    e.printStackTrace();
                    // If there's an error parsing the history, return an empty list
                    response.setMessages(List.of());
                }
            } else {
                System.out.println("History is null or empty");
                response.setMessages(List.of());
            }
            
            return response;
        } catch (Exception e) {
            System.err.println("Error in fromSession: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to parse session history", e);
        }
    }
} 