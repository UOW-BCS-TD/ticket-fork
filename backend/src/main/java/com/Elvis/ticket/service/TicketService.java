package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Ticket;
import com.Elvis.ticket.model.TicketStatus;
import com.Elvis.ticket.model.CustomerRole;
import com.Elvis.ticket.model.Session;
import com.Elvis.ticket.model.Engineer;
import com.Elvis.ticket.model.Customer;
import com.Elvis.ticket.model.Product;
import com.Elvis.ticket.model.TicketType;
import com.Elvis.ticket.model.TeslaModel;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.repository.TicketRepository;
import com.Elvis.ticket.repository.EngineerRepository;
import com.Elvis.ticket.repository.CustomerRepository;
import com.Elvis.ticket.repository.ProductRepository;
import com.Elvis.ticket.repository.TicketTypeRepository;
import com.Elvis.ticket.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import com.Elvis.ticket.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.*;

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
    private final UserService userService;

    public TicketService(TicketRepository ticketRepository, 
                        EngineerRepository engineerRepository,
                        CustomerRepository customerRepository,
                        ProductRepository productRepository,
                        TicketTypeRepository ticketTypeRepository,
                        SessionRepository sessionRepository,
                        UserService userService) {
        this.ticketRepository = ticketRepository;
        this.engineerRepository = engineerRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.sessionRepository = sessionRepository;
        this.userService = userService;
    }

    @Transactional
    public Ticket createTicket(Ticket ticket) {
        // If customer is not set, use the authenticated user
        if (ticket.getCustomer() == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            Customer customer = customerRepository.findByEmail(email);
            if (customer == null) {
                throw new RuntimeException("Authenticated customer not found");
            }
            ticket.setCustomer(customer);
        }
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
        // --- Engineer assignment logic ---
        if (ticket.getEngineer() == null || ticket.getEngineer().getId() == null) {
            // Map product name to TeslaModel category
            TeslaModel category = null;
            String productName = product.getName();
            if ("Model S".equalsIgnoreCase(productName)) category = TeslaModel.MODEL_S;
            else if ("Model 3".equalsIgnoreCase(productName)) category = TeslaModel.MODEL_3;
            else if ("Model X".equalsIgnoreCase(productName)) category = TeslaModel.MODEL_X;
            else if ("Model Y".equalsIgnoreCase(productName)) category = TeslaModel.MODEL_Y;
            else if ("Cybertruck".equalsIgnoreCase(productName)) category = TeslaModel.CYBERTRUCK;

            Engineer assignedEngineer = null;
            List<Engineer> availableEngineers = null;
            if (category != null) {
                // Use only available engineers (currentTickets < maxTickets) and level 1
                availableEngineers = engineerRepository.findByCategoryAndCurrentTicketsLessThanMaxTickets(category)
                    .stream().filter(e -> e.getLevel() == 1).toList();
            }
            if (availableEngineers != null && !availableEngineers.isEmpty()) {
                // Find the engineer with the least currentTickets
                assignedEngineer = availableEngineers.get(0);
                for (Engineer eng : availableEngineers) {
                    if (eng.getCurrentTickets() < assignedEngineer.getCurrentTickets()) {
                        assignedEngineer = eng;
                    }
                }
            } else {
                // Fallback: get all available level 1 engineers and pick the one with the least tickets
                List<Engineer> allLevel1 = engineerRepository.findByLevel(1)
                    .stream().filter(e -> e.getCurrentTickets() < e.getMaxTickets()).toList();
                if (allLevel1 != null && !allLevel1.isEmpty()) {
                    assignedEngineer = allLevel1.get(0);
                    for (Engineer eng : allLevel1) {
                        if (eng.getCurrentTickets() < assignedEngineer.getCurrentTickets()) {
                            assignedEngineer = eng;
                        }
                    }
                }
            }
            if (assignedEngineer != null) {
                ticket.setEngineer(assignedEngineer);
                // Increment engineer's currentTickets
                assignedEngineer.setCurrentTickets(assignedEngineer.getCurrentTickets() + 1);
                engineerRepository.save(assignedEngineer);
            } else {
                throw new RuntimeException("No available engineer found for this product category.");
            }
        } else {
            // Ensure engineer is a managed entity
            Engineer engineer = engineerRepository.findById(ticket.getEngineer().getId())
                .orElseThrow(() -> new RuntimeException("Engineer not found"));
            ticket.setEngineer(engineer);
            // Increment engineer's currentTickets
            engineer.setCurrentTickets(engineer.getCurrentTickets() + 1);
            engineerRepository.save(engineer);
        }
        // Set timestamps and status
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatus.OPEN);
        Ticket savedTicket = ticketRepository.save(ticket);
        // Add engineer welcome message to ticket history
        if (ticket.getEngineer() != null && ticket.getCustomer() != null) {
            Engineer engineer = ticket.getEngineer();
            String engineerName = engineer.getUser().getName();
            String customerName = customer.getUser().getName();
            String text = String.format("Hi %s, I am %s. I will be helping you to solve your problem, please let me have a look at the problem first.", customerName, engineerName);
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> ticketHistory = new ArrayList<>();
            try {
                if (savedTicket.getHistory() != null && !savedTicket.getHistory().isEmpty()) {
                    ticketHistory = mapper.readValue(savedTicket.getHistory(), new TypeReference<List<Map<String, Object>>>() {});
                }
            } catch (Exception e) {
                ticketHistory = new ArrayList<>();
            }
            Map<String, Object> engineerMsg = new HashMap<>();
            engineerMsg.put("role", "engineer");
            engineerMsg.put("content", text);
            engineerMsg.put("timestamp", java.time.LocalDateTime.now().toString());
            ticketHistory.add(engineerMsg);
            try {
                savedTicket.setHistory(mapper.writeValueAsString(ticketHistory));
                ticketRepository.save(savedTicket);
            } catch (Exception e) {
                // handle error
            }
        }
        return savedTicket;
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
    public Ticket updateTicketUrgency(Long ticketId, String urgency) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setUrgency(urgency);
        ticket.setUpdatedAt(LocalDateTime.now());
        
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

                    TeslaModel category = currentEngineer.getCategory();
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

    @Transactional
    public Ticket appendCustomerMessageToHistory(Long ticketId, User user, String content) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.List<java.util.Map<String, Object>> history;
        try {
            if (ticket.getHistory() != null && !ticket.getHistory().isEmpty()) {
                history = mapper.readValue(ticket.getHistory(), new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>() {});
            } else {
                history = new java.util.ArrayList<>();
            }
        } catch (Exception e) {
            history = new java.util.ArrayList<>();
        }
        java.util.Map<String, Object> msg = new java.util.HashMap<>();
        msg.put("role", "customer");
        msg.put("content", content);
        msg.put("timestamp", java.time.LocalDateTime.now().toString());
        history.add(msg);
        try {
            ticket.setHistory(mapper.writeValueAsString(history));
        } catch (Exception e) {
            // ignore
        }
        ticket.setUpdatedAt(java.time.LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket appendMessageToHistory(Long ticketId, User user, String content, String role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.List<java.util.Map<String, Object>> history;
        try {
            if (ticket.getHistory() != null && !ticket.getHistory().isEmpty()) {
                history = mapper.readValue(ticket.getHistory(), new com.fasterxml.jackson.core.type.TypeReference<java.util.List<java.util.Map<String, Object>>>() {});
            } else {
                history = new java.util.ArrayList<>();
            }
        } catch (Exception e) {
            history = new java.util.ArrayList<>();
        }
        java.util.Map<String, Object> msg = new java.util.HashMap<>();
        msg.put("role", role);
        msg.put("content", content);
        msg.put("timestamp", java.time.LocalDateTime.now().toString());
        history.add(msg);
        try {
            ticket.setHistory(mapper.writeValueAsString(history));
        } catch (Exception e) {
            // ignore
        }
        ticket.setUpdatedAt(java.time.LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
} 