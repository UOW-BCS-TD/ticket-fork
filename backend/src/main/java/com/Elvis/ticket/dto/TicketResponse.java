package com.Elvis.ticket.dto;

import com.Elvis.ticket.model.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String title;
    private TicketStatus status;
    private String urgency;
    private TeslaModel category;
    private TicketType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private UserInfo customer;
    private UserInfo engineer;
    private Long session_id;
    private String history;

    @Data
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String role;

        public static UserInfo fromUser(User user) {
            if (user == null) return null;
            UserInfo userInfo = new UserInfo();
            userInfo.setId(user.getId());
            userInfo.setName(user.getName());
            userInfo.setEmail(user.getEmail());
            userInfo.setRole(user.getRole());
            return userInfo;
        }
    }

    public String getHistory() { return history; }
    public void setHistory(String history) { this.history = history; }

    public static TicketResponse fromTicket(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setStatus(ticket.getStatus());
        response.setUrgency(ticket.getUrgency());
        response.setType(ticket.getType());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());
        response.setCustomer(ticket.getCustomer() != null ? UserInfo.fromUser(ticket.getCustomer().getUser()) : null);
        response.setEngineer(ticket.getEngineer() != null ? UserInfo.fromUser(ticket.getEngineer().getUser()) : null);
        if (ticket.getSession() != null) {
            response.setSession_id(ticket.getSession().getId());
        }
        response.setHistory(ticket.getHistory());
        response.setCategory(ticket.getCategory());
        return response;
    }
} 