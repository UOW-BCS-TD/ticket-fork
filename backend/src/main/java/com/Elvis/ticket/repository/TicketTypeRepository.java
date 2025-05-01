package com.Elvis.ticket.repository;

import com.Elvis.ticket.model.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {
    boolean existsByName(String name);
    TicketType findByName(String name);
} 