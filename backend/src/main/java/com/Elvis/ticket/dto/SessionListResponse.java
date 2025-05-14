package com.Elvis.ticket.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SessionListResponse {
    private Long id;
    private String title;
    private LocalDateTime lastActivity;
    private String status;

    public static SessionListResponse fromSession(com.Elvis.ticket.model.Session session) {
        SessionListResponse response = new SessionListResponse();
        response.setId(session.getId());
        response.setTitle(session.getTitle());
        response.setLastActivity(session.getLastActivity());
        response.setStatus(session.getStatus().name());
        return response;
    }
} 