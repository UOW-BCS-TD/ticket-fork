package com.Elvis.ticket.service;

import com.Elvis.ticket.model.*;
import com.Elvis.ticket.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final EngineerService engineerService;
    private final CustomerService customerService;
    private final SessionService sessionService;

    @Autowired
    public TicketService(TicketRepository ticketRepository, 
                        EngineerService engineerService,
                        CustomerService customerService,
                        SessionService sessionService) {
        this.ticketRepository = ticketRepository;
        this.engineerService = engineerService;
        this.customerService = customerService;
        this.sessionService = sessionService;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public List<Ticket> getTicketsByCustomer(Long customerId) {
        return ticketRepository.findByCustomerId(customerId);
    }

    public List<Ticket> getTicketsByEngineer(Long engineerId) {
        return ticketRepository.findByEngineerId(engineerId);
    }

    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status);
    }

    @Transactional
    public Ticket createTicket(Ticket ticket) {
        // Validate customer
        Customer customer = customerService.getCustomerById(ticket.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Set customer role as ticket urgency
        ticket.setUrgency(customer.getRole());

        // Assign engineer based on category and availability
        if (ticket.getEngineer() == null) {
            List<Engineer> availableEngineers = engineerService.getAvailableEngineers();
            if (!availableEngineers.isEmpty()) {
                Engineer engineer = availableEngineers.get(0);
                ticket.setEngineer(engineer);
                engineerService.incrementTicketCount(engineer.getId());
            }
        }

        // Update session
        Session session = sessionService.getSessionById(ticket.getSession().getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setLastActivity(LocalDateTime.now());
        sessionService.updateSession(session);

        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateTicket(Long id, Ticket ticketDetails) {
        return ticketRepository.findById(id)
                .map(existingTicket -> {
                    // Update basic fields
                    existingTicket.setStatus(ticketDetails.getStatus());
                    existingTicket.setLastResponseTime(LocalDateTime.now());

                    // Handle engineer assignment
                    if (ticketDetails.getEngineer() != null && 
                        !ticketDetails.getEngineer().getId().equals(existingTicket.getEngineer().getId())) {
                        // Decrement old engineer's ticket count
                        if (existingTicket.getEngineer() != null) {
                            engineerService.decrementTicketCount(existingTicket.getEngineer().getId());
                        }
                        // Increment new engineer's ticket count
                        engineerService.incrementTicketCount(ticketDetails.getEngineer().getId());
                        existingTicket.setEngineer(ticketDetails.getEngineer());
                    }

                    // Update resolution time if status changed to RESOLVED
                    if (ticketDetails.getStatus() == TicketStatus.RESOLVED && 
                        existingTicket.getStatus() != TicketStatus.RESOLVED) {
                        existingTicket.setResolvedAt(LocalDateTime.now());
                    }

                    return ticketRepository.save(existingTicket);
                })
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    @Transactional
    public void deleteTicket(Long id) {
        ticketRepository.findById(id).ifPresent(ticket -> {
            // Decrement engineer's ticket count
            if (ticket.getEngineer() != null) {
                engineerService.decrementTicketCount(ticket.getEngineer().getId());
            }
            ticketRepository.deleteById(id);
        });
    }

    public List<Ticket> getTicketsByUrgency(CustomerRole urgency) {
        return ticketRepository.findByUrgency(urgency);
    }

    public List<Ticket> getTicketsByProduct(Long productId) {
        return ticketRepository.findByProductId(productId);
    }

    public List<Ticket> getTicketsByType(Long typeId) {
        return ticketRepository.findByTypeId(typeId);
    }
} 