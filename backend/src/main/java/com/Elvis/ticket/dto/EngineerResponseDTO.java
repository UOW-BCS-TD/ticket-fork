package com.Elvis.ticket.dto;

import com.Elvis.ticket.model.Engineer;
import com.Elvis.ticket.model.TeslaModel;
import lombok.Data;

@Data
public class EngineerResponseDTO {
    private Long id;
    private String email;
    private TeslaModel category;
    private Integer level;
    private Integer maxTickets;
    private Integer currentTickets;
    private UserResponseDTO user;

    public static EngineerResponseDTO fromEngineer(Engineer engineer) {
        EngineerResponseDTO dto = new EngineerResponseDTO();
        dto.setId(engineer.getId());
        dto.setEmail(engineer.getEmail());
        dto.setCategory(engineer.getCategory());
        dto.setLevel(engineer.getLevel());
        dto.setMaxTickets(engineer.getMaxTickets());
        dto.setCurrentTickets(engineer.getCurrentTickets());
        dto.setUser(UserResponseDTO.fromUser(engineer.getUser()));
        return dto;
    }
} 