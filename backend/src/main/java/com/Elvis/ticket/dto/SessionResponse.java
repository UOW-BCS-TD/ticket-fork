package com.Elvis.ticket.dto;

import com.Elvis.ticket.model.Session;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SessionResponse {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime lastActivity;
    private UserInfo user;
    private String title;
    private boolean ticketSession;

    @Data
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String role;

        public static UserInfo fromUser(com.Elvis.ticket.model.User user) {
            UserInfo userInfo = new UserInfo();
            userInfo.setId(user.getId());
            userInfo.setName(user.getName());
            userInfo.setEmail(user.getEmail());
            userInfo.setRole(user.getRole());
            return userInfo;
        }
    }

    public static SessionResponse fromSession(Session session) {
        SessionResponse response = new SessionResponse();
        response.setId(session.getId());
        response.setStartTime(session.getStartTime());
        response.setEndTime(session.getEndTime());
        response.setLastActivity(session.getLastActivity());
        response.setUser(UserInfo.fromUser(session.getUser()));
        response.setTitle(session.getTitle());
        response.setTicketSession(session.isTicketSession());
        return response;
    }
} 