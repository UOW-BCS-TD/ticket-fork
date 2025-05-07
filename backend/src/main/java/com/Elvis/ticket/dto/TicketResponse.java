package com.Elvis.ticket.dto;

import com.Elvis.ticket.model.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private TicketStatus status;
    private String urgency;
    private Product product;
    private TicketType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserInfo customer;
    private UserInfo engineer;

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

    public static TicketResponse fromTicket(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setStatus(ticket.getStatus());
        response.setUrgency(ticket.getUrgency());
        response.setProduct(ticket.getProduct());
        response.setType(ticket.getType());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setCustomer(ticket.getCustomer() != null ? UserInfo.fromUser(ticket.getCustomer().getUser()) : null);
        response.setEngineer(ticket.getEngineer() != null ? UserInfo.fromUser(ticket.getEngineer().getUser()) : null);
        return response;
    }
} 