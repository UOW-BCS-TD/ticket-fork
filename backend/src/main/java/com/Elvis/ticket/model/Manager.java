package com.Elvis.ticket.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "managers")
@EqualsAndHashCode(callSuper = true)
public class Manager extends User {
    @Column(nullable = false)
    private String department;
} 