package com.Elvis.ticket.repository;

import com.Elvis.ticket.model.Ticket;
import com.Elvis.ticket.model.TicketStatus;
import com.Elvis.ticket.model.CustomerRole;
import com.Elvis.ticket.model.TeslaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCustomerId(Long customerId);
    List<Ticket> findByEngineerId(Long engineerId);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByCustomerIdAndStatus(Long customerId, TicketStatus status);
    List<Ticket> findByEngineerIdAndStatus(Long engineerId, TicketStatus status);
    List<Ticket> findByUrgency(CustomerRole urgency);
    List<Ticket> findByCategory(TeslaModel category);
    List<Ticket> findByTypeId(Long typeId);
    List<Ticket> findBySessionId(Long sessionId);
    boolean existsByEngineerIdAndSessionId(Long engineerId, Long sessionId);
} 