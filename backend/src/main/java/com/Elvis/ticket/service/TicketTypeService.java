package com.Elvis.ticket.service;

import com.Elvis.ticket.model.TicketType;
import com.Elvis.ticket.repository.TicketTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TicketTypeService {

    private final TicketTypeRepository ticketTypeRepository;

    public TicketTypeService(TicketTypeRepository ticketTypeRepository) {
        this.ticketTypeRepository = ticketTypeRepository;
    }

    @Transactional
    public TicketType createTicketType(TicketType ticketType) {
        if (ticketTypeRepository.existsByName(ticketType.getName())) {
            throw new RuntimeException("Ticket type with this name already exists");
        }
        return ticketTypeRepository.save(ticketType);
    }

    @Transactional(readOnly = true)
    public List<TicketType> getAllTicketTypes() {
        return ticketTypeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<TicketType> getTicketTypeById(Long id) {
        return ticketTypeRepository.findById(id);
    }

    @Transactional
    public TicketType updateTicketType(Long id, TicketType ticketTypeDetails) {
        return ticketTypeRepository.findById(id)
                .map(existingTicketType -> {
                    existingTicketType.setName(ticketTypeDetails.getName());
                    existingTicketType.setDescription(ticketTypeDetails.getDescription());
                    return ticketTypeRepository.save(existingTicketType);
                })
                .orElseThrow(() -> new RuntimeException("Ticket type not found"));
    }

    @Transactional
    public void deleteTicketType(Long id) {
        ticketTypeRepository.deleteById(id);
    }
} 