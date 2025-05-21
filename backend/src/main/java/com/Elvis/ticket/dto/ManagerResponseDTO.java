package com.Elvis.ticket.dto;

import com.Elvis.ticket.model.Manager;
import lombok.Data;

@Data
public class ManagerResponseDTO {
    private Long id;
    private String email;
    private String department;
    private UserResponseDTO user;

    public static ManagerResponseDTO fromManager(Manager manager) {
        ManagerResponseDTO dto = new ManagerResponseDTO();
        dto.setId(manager.getId());
        dto.setEmail(manager.getEmail());
        dto.setDepartment(manager.getDepartment());
        dto.setUser(UserResponseDTO.fromUser(manager.getUser()));
        return dto;
    }
} 