package com.Elvis.ticket.controller;

import com.Elvis.ticket.model.Ticket;
import com.Elvis.ticket.model.TicketStatus;
import com.Elvis.ticket.model.CustomerRole;
import com.Elvis.ticket.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public List<Ticket> getTicketsByCustomer(@PathVariable Long customerId) {
        return ticketService.getTicketsByCustomer(customerId);
    }

    @GetMapping("/engineer/{engineerId}")
    public List<Ticket> getTicketsByEngineer(@PathVariable Long engineerId) {
        return ticketService.getTicketsByEngineer(engineerId);
    }

    @GetMapping("/status/{status}")
    public List<Ticket> getTicketsByStatus(@PathVariable TicketStatus status) {
        return ticketService.getTicketsByStatus(status);
    }

    @GetMapping("/urgency/{urgency}")
    public List<Ticket> getTicketsByUrgency(@PathVariable CustomerRole urgency) {
        return ticketService.getTicketsByUrgency(urgency);
    }

    @GetMapping("/product/{productId}")
    public List<Ticket> getTicketsByProduct(@PathVariable Long productId) {
        return ticketService.getTicketsByProduct(productId);
    }

    @GetMapping("/type/{typeId}")
    public List<Ticket> getTicketsByType(@PathVariable Long typeId) {
        return ticketService.getTicketsByType(typeId);
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @RequestBody Ticket ticketDetails) {
        try {
            Ticket updatedTicket = ticketService.updateTicket(id, ticketDetails);
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/escalate")
    public ResponseEntity<Ticket> escalateTicket(@PathVariable Long id) {
        try {
            Ticket escalatedTicket = ticketService.escalateTicket(id);
            return ResponseEntity.ok(escalatedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 