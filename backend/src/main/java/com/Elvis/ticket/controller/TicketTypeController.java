package com.Elvis.ticket.controller;

import com.Elvis.ticket.model.TicketType;
import com.Elvis.ticket.service.TicketTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ticket-types")
public class TicketTypeController {

    private final TicketTypeService ticketTypeService;

    @Autowired
    public TicketTypeController(TicketTypeService ticketTypeService) {
        this.ticketTypeService = ticketTypeService;
    }

    @GetMapping
    public List<TicketType> getAllTicketTypes() {
        return ticketTypeService.getAllTicketTypes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketType> getTicketTypeById(@PathVariable Long id) {
        return ticketTypeService.getTicketTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TicketType createTicketType(@RequestBody TicketType ticketType) {
        return ticketTypeService.createTicketType(ticketType);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketType> updateTicketType(@PathVariable Long id, @RequestBody TicketType ticketType) {
        try {
            TicketType updatedTicketType = ticketTypeService.updateTicketType(id, ticketType);
            return ResponseEntity.ok(updatedTicketType);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicketType(@PathVariable Long id) {
        try {
            ticketTypeService.deleteTicketType(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 