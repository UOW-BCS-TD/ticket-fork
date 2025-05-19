package com.Elvis.ticket.dto;

import com.Elvis.ticket.model.TeslaModel;
import lombok.Data;

@Data
public class CreateEngineerRequest {
    private String name;
    private String email;
    private TeslaModel category;
    private Integer level;
    private Integer maxTickets;
} 