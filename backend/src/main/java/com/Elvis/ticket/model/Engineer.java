package com.Elvis.ticket.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "engineers")
@EqualsAndHashCode(callSuper = true)
public class Engineer extends User {
    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Integer level;

    @Column(name = "current_ticket_count")
    private Integer currentTicketCount = 0;

    @Column(name = "max_ticket_count")
    private Integer maxTicketCount = 5;
} 