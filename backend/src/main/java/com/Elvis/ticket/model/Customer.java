package com.Elvis.ticket.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "customers")
@EqualsAndHashCode(callSuper = true)
public class Customer extends User {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerRole role = CustomerRole.NORMAL;
} 