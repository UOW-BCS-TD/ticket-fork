package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Ticket;
import com.Elvis.ticket.model.TicketStatus;
import com.Elvis.ticket.model.CustomerRole;
import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.model.Engineer;
import com.Elvis.ticket.model.Customer;
import com.Elvis.ticket.model.Product;
import com.Elvis.ticket.model.TicketType;
import com.Elvis.ticket.repository.TicketRepository;
import com.Elvis.ticket.repository.EngineerRepository;
import com.Elvis.ticket.repository.CustomerRepository;
import com.Elvis.ticket.repository.ProductRepository;
import com.Elvis.ticket.repository.TicketTypeRepository;
import com.Elvis.ticket.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final EngineerRepository engineerRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final SessionRepository sessionRepository;

    public TicketService(TicketRepository ticketRepository, 
                        EngineerRepository engineerRepository,
                        CustomerRepository customerRepository,
                        ProductRepository productRepository,
                        TicketTypeRepository ticketTypeRepository,
                        SessionRepository sessionRepository) {
        this.ticketRepository = ticketRepository;
        this.engineerRepository = engineerRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional
    public Ticket createTicket(Ticket ticket) {
        // Validate all foreign key references exist
        Customer customer = customerRepository.findById(ticket.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        Product product = productRepository.findById(ticket.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        TicketType type = ticketTypeRepository.findById(ticket.getType().getId())
                .orElseThrow(() -> new RuntimeException("Ticket type not found"));
        
        Session session = sessionRepository.findById(ticket.getSession().getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // Set the validated entities
        ticket.setCustomer(customer);
        ticket.setProduct(product);
        ticket.setType(type);
        ticket.setSession(session);

        // Set timestamps and status
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatus.OPEN);

        return ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByCustomerId(Long customerId) {
        return ticketRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByEngineerId(Long engineerId) {
        return ticketRepository.findByEngineerId(engineerId);
    }

    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status);
    }

    @Transactional
    public Ticket assignTicket(Long ticketId, Long engineerId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Engineer engineer = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new RuntimeException("Engineer not found"));

        if (engineer.getCurrentTickets() >= engineer.getMaxTickets()) {
            throw new RuntimeException("Engineer has reached maximum ticket capacity");
        }

        ticket.setEngineer(engineer);
        ticket.setStatus(TicketStatus.ASSIGNED);
        ticket.setUpdatedAt(LocalDateTime.now());
        
        engineer.setCurrentTickets(engineer.getCurrentTickets() + 1);
        engineerRepository.save(engineer);
        
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateTicketStatus(Long ticketId, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        
        if (status == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            if (ticket.getEngineer() != null) {
                Engineer engineer = ticket.getEngineer();
                engineer.setCurrentTickets(engineer.getCurrentTickets() - 1);
                engineerRepository.save(engineer);
            }
        }
        
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateTicket(Long id, Ticket ticketDetails) {
        return ticketRepository.findById(id)
                .map(existingTicket -> {
                    // Validate and update product if changed
                    if (ticketDetails.getProduct() != null && 
                        !ticketDetails.getProduct().getId().equals(existingTicket.getProduct().getId())) {
                        Product product = productRepository.findById(ticketDetails.getProduct().getId())
                                .orElseThrow(() -> new RuntimeException("Product not found"));
                        existingTicket.setProduct(product);
                    }

                    // Validate and update ticket type if changed
                    if (ticketDetails.getType() != null && 
                        !ticketDetails.getType().getId().equals(existingTicket.getType().getId())) {
                        TicketType type = ticketTypeRepository.findById(ticketDetails.getType().getId())
                                .orElseThrow(() -> new RuntimeException("Ticket type not found"));
                        existingTicket.setType(type);
                    }

                    existingTicket.setTitle(ticketDetails.getTitle());
                    existingTicket.setDescription(ticketDetails.getDescription());
                    existingTicket.setUrgency(ticketDetails.getUrgency());
                    existingTicket.setUpdatedAt(LocalDateTime.now());
                    return ticketRepository.save(existingTicket);
                })
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    @Transactional
    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
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

    @Transactional
    public Ticket escalateTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    // Get current engineer and their category
                    Engineer currentEngineer = ticket.getEngineer();
                    if (currentEngineer == null) {
                        throw new RuntimeException("Ticket has no assigned engineer to escalate from");
                    }

                    String category = currentEngineer.getCategory();
                    int currentLevel = currentEngineer.getLevel();

                    // Find available engineers in the same category with higher level
                    List<Engineer> higherLevelEngineers = engineerRepository.findByCategoryAndLevelGreaterThan(category, currentLevel)
                            .stream()
                            .filter(e -> e.getCategory().equals(category) && e.getLevel() > currentLevel)
                            .toList();

                    if (higherLevelEngineers.isEmpty()) {
                        throw new RuntimeException("No higher-level engineers available in category: " + category);
                    }

                    // Select the first available higher-level engineer
                    Engineer newEngineer = higherLevelEngineers.get(0);

                    // Decrement old engineer's ticket count
                    currentEngineer.setCurrentTickets(currentEngineer.getCurrentTickets() - 1);
                    engineerRepository.save(currentEngineer);

                    // Update ticket with new engineer
                    ticket.setEngineer(newEngineer);
                    ticket.setStatus(TicketStatus.ESCALATED);
                    ticket.setUpdatedAt(LocalDateTime.now());

                    // Increment new engineer's ticket count
                    newEngineer.setCurrentTickets(newEngineer.getCurrentTickets() + 1);
                    engineerRepository.save(newEngineer);

                    return ticketRepository.save(ticket);
                })
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByCustomer(Long customerId) {
        return ticketRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByEngineer(Long engineerId) {
        return ticketRepository.findByEngineerId(engineerId);
    }
} 