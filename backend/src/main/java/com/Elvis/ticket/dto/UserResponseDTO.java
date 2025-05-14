package com.Elvis.ticket.dto;

import com.Elvis.ticket.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private String role;
    private LocalDateTime createdAt;

    public static UserResponseDTO fromUser(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
} 