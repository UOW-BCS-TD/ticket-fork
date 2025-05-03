package com.Elvis.ticket.config;

import com.Elvis.ticket.model.*;
import com.Elvis.ticket.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository,
                                 CustomerRepository customerRepository,
                                 EngineerRepository engineerRepository,
                                 ManagerRepository managerRepository,
                                 ProductRepository productRepository,
                                 TicketTypeRepository ticketTypeRepository,
                                 PasswordEncoder passwordEncoder) {
        return args -> {
            LocalDateTime now = LocalDateTime.now();

            // Create users first if they don't exist
            if (!userRepository.existsByEmail("admin@example.com")) {
                User adminUser = new User();
                adminUser.setName("Admin User");
                adminUser.setEmail("admin@example.com");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setRole(UserRole.ADMIN.name());
                adminUser.setCreatedAt(now);
                adminUser = userRepository.save(adminUser);
            }

            if (!userRepository.existsByEmail("customer@example.com")) {
                User customerUser = new User();
                customerUser.setName("Customer User");
                customerUser.setEmail("customer@example.com");
                customerUser.setPassword(passwordEncoder.encode("customer123"));
                customerUser.setRole(UserRole.CUSTOMER.name());
                customerUser.setCreatedAt(now);
                customerUser = userRepository.save(customerUser);
            }

            if (!userRepository.existsByEmail("engineer@example.com")) {
                User engineerUser = new User();
                engineerUser.setName("Engineer User");
                engineerUser.setEmail("engineer@example.com");
                engineerUser.setPassword(passwordEncoder.encode("engineer123"));
                engineerUser.setRole(UserRole.ENGINEER.name());
                engineerUser.setCreatedAt(now);
                engineerUser = userRepository.save(engineerUser);
            }

            if (!userRepository.existsByEmail("manager@example.com")) {
                User managerUser = new User();
                managerUser.setName("Manager User");
                managerUser.setEmail("manager@example.com");
                managerUser.setPassword(passwordEncoder.encode("manager123"));
                managerUser.setRole(UserRole.MANAGER.name());
                managerUser.setCreatedAt(now);
                managerUser = userRepository.save(managerUser);
            }

            // Get the users for creating other entities
            User customerUser = userRepository.findByEmail("customer@example.com");
            User engineerUser = userRepository.findByEmail("engineer@example.com");
            User managerUser = userRepository.findByEmail("manager@example.com");

            // Create customers if they don't exist
            if (!customerRepository.existsByEmail("customer@example.com")) {
                Customer customer = new Customer();
                customer.setUser(customerUser);
                customer.setEmail(customerUser.getEmail());
                customer.setRole(CustomerRole.STANDARD.name());
                customerRepository.save(customer);
            }

            // Create engineers if they don't exist
            if (!engineerRepository.existsByEmail("engineer@example.com")) {
                Engineer engineer = new Engineer();
                engineer.setUser(engineerUser);
                engineer.setEmail(engineerUser.getEmail());
                engineer.setCategory("Software");
                engineer.setLevel(1);
                engineer.setMaxTickets(5);
                engineer.setCurrentTickets(0);
                engineerRepository.save(engineer);
            }

            // Create managers if they don't exist
            if (!managerRepository.existsByEmail("manager@example.com")) {
                Manager manager = new Manager();
                manager.setUser(managerUser);
                manager.setEmail(managerUser.getEmail());
                manager.setDepartment("IT");
                managerRepository.save(manager);
            }

            // Create products if they don't exist
            if (productRepository.count() == 0) {
                Product product1 = new Product();
                product1.setName("Product A");
                product1.setDescription("Description for Product A");
                product1.setCreatedAt(now);
                productRepository.save(product1);

                Product product2 = new Product();
                product2.setName("Product B");
                product2.setDescription("Description for Product B");
                product2.setCreatedAt(now);
                productRepository.save(product2);
            }

            // Create ticket types if they don't exist
            if (ticketTypeRepository.count() == 0) {
                TicketType type1 = new TicketType();
                type1.setName("Technical Support");
                type1.setDescription("Technical support tickets");
                ticketTypeRepository.save(type1);

                TicketType type2 = new TicketType();
                type2.setName("Feature Request");
                type2.setDescription("Feature request tickets");
                ticketTypeRepository.save(type2);
            }
        };
    }
} 