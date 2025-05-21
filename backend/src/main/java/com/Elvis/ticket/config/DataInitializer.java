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
                                 SessionRepository sessionRepository,
                                 TicketRepository ticketRepository,
                                 PasswordEncoder passwordEncoder) {
        return args -> {
            LocalDateTime now = LocalDateTime.now();

            // Create admin user if it doesn't exist
            if (!userRepository.existsByEmail("admin@example.com")) {
                User adminUser = new User();
                adminUser.setName("Admin User");
                adminUser.setEmail("admin@example.com");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setRole(UserRole.ADMIN.name());
                adminUser.setCreatedAt(now);
                adminUser = userRepository.save(adminUser);
            }

            // Create manager users
            createManagerUser("Model S Manager", "ms@example.com", TeslaModel.MODEL_S, userRepository, passwordEncoder, now);
            createManagerUser("Model 3 Manager", "m3@example.com", TeslaModel.MODEL_3, userRepository, passwordEncoder, now);
            createManagerUser("Model X Manager", "mx@example.com", TeslaModel.MODEL_X, userRepository, passwordEncoder, now);
            createManagerUser("Model Y Manager", "my@example.com", TeslaModel.MODEL_Y, userRepository, passwordEncoder, now);
            createManagerUser("Cybertruck Manager", "ct@example.com", TeslaModel.CYBERTRUCK, userRepository, passwordEncoder, now);

            // Create Level 1 Engineers
            createEngineerUser("John Smith", "l1ms@example.com", TeslaModel.MODEL_S, 1, userRepository, passwordEncoder, now);
            createEngineerUser("Sarah Johnson", "l1m3@example.com", TeslaModel.MODEL_3, 1, userRepository, passwordEncoder, now);
            createEngineerUser("Michael Brown", "l1mx@example.com", TeslaModel.MODEL_X, 1, userRepository, passwordEncoder, now);
            createEngineerUser("Emily Davis", "l1my@example.com", TeslaModel.MODEL_Y, 1, userRepository, passwordEncoder, now);
            createEngineerUser("David Wilson", "l1ct@example.com", TeslaModel.CYBERTRUCK, 1, userRepository, passwordEncoder, now);

            // Create Level 2 Engineers
            createEngineerUser("James Taylor", "l2ms@example.com", TeslaModel.MODEL_S, 2, userRepository, passwordEncoder, now);
            createEngineerUser("Lisa Anderson", "l2m3@example.com", TeslaModel.MODEL_3, 2, userRepository, passwordEncoder, now);
            createEngineerUser("Robert Martinez", "l2mx@example.com", TeslaModel.MODEL_X, 2, userRepository, passwordEncoder, now);
            createEngineerUser("Jennifer Garcia", "l2my@example.com", TeslaModel.MODEL_Y, 2, userRepository, passwordEncoder, now);
            createEngineerUser("William Lee", "l2ct@example.com", TeslaModel.CYBERTRUCK, 2, userRepository, passwordEncoder, now);

            // Create Level 3 Engineers
            createEngineerUser("Elizabeth White", "l3ms@example.com", TeslaModel.MODEL_S, 3, userRepository, passwordEncoder, now);
            createEngineerUser("Thomas Clark", "l3m3@example.com", TeslaModel.MODEL_3, 3, userRepository, passwordEncoder, now);
            createEngineerUser("Patricia Lewis", "l3mx@example.com", TeslaModel.MODEL_X, 3, userRepository, passwordEncoder, now);
            createEngineerUser("Daniel Walker", "l3my@example.com", TeslaModel.MODEL_Y, 3, userRepository, passwordEncoder, now);
            createEngineerUser("Margaret Hall", "l3ct@example.com", TeslaModel.CYBERTRUCK, 3, userRepository, passwordEncoder, now);

            // Create sample customer users
            createCustomerUser("Alice Cooper", "svip@example.com", CustomerRole.VIP, userRepository, passwordEncoder, now);
            createCustomerUser("Bob Wilson", "vip@example.com", CustomerRole.PREMIUM, userRepository, passwordEncoder, now);
            createCustomerUser("Carol White", "cus@example.com", CustomerRole.STANDARD, userRepository, passwordEncoder, now);

            // Create managers for each Tesla model
            createManager(managerRepository, userRepository, "ms@example.com", "Model S Support", TeslaModel.MODEL_S.name());
            createManager(managerRepository, userRepository, "m3@example.com", "Model 3 Support", TeslaModel.MODEL_3.name());
            createManager(managerRepository, userRepository, "mx@example.com", "Model X Support", TeslaModel.MODEL_X.name());
            createManager(managerRepository, userRepository, "my@example.com", "Model Y Support", TeslaModel.MODEL_Y.name());
            createManager(managerRepository, userRepository, "ct@example.com", "Cybertruck Support", TeslaModel.CYBERTRUCK.name());

            // Create Level 1 Engineers
            createEngineer(engineerRepository, userRepository, "l1ms@example.com", TeslaModel.MODEL_S.name(), 1, 3);
            createEngineer(engineerRepository, userRepository, "l1m3@example.com", TeslaModel.MODEL_3.name(), 1, 3);
            createEngineer(engineerRepository, userRepository, "l1mx@example.com", TeslaModel.MODEL_X.name(), 1, 3);
            createEngineer(engineerRepository, userRepository, "l1my@example.com", TeslaModel.MODEL_Y.name(), 1, 3);
            createEngineer(engineerRepository, userRepository, "l1ct@example.com", TeslaModel.CYBERTRUCK.name(), 1, 3);

            // Create Level 2 Engineers
            createEngineer(engineerRepository, userRepository, "l2ms@example.com", TeslaModel.MODEL_S.name(), 2, 4);
            createEngineer(engineerRepository, userRepository, "l2m3@example.com", TeslaModel.MODEL_3.name(), 2, 4);
            createEngineer(engineerRepository, userRepository, "l2mx@example.com", TeslaModel.MODEL_X.name(), 2, 4);
            createEngineer(engineerRepository, userRepository, "l2my@example.com", TeslaModel.MODEL_Y.name(), 2, 4);
            createEngineer(engineerRepository, userRepository, "l2ct@example.com", TeslaModel.CYBERTRUCK.name(), 2, 4);

            // Create Level 3 Engineers
            createEngineer(engineerRepository, userRepository, "l3ms@example.com", TeslaModel.MODEL_S.name(), 3, 5);
            createEngineer(engineerRepository, userRepository, "l3m3@example.com", TeslaModel.MODEL_3.name(), 3, 5);
            createEngineer(engineerRepository, userRepository, "l3mx@example.com", TeslaModel.MODEL_X.name(), 3, 5);
            createEngineer(engineerRepository, userRepository, "l3my@example.com", TeslaModel.MODEL_Y.name(), 3, 5);
            createEngineer(engineerRepository, userRepository, "l3ct@example.com", TeslaModel.CYBERTRUCK.name(), 3, 5);

            // Create sample customers
            createCustomer(customerRepository, userRepository, "svip@example.com", CustomerRole.VIP);
            createCustomer(customerRepository, userRepository, "vip@example.com", CustomerRole.PREMIUM);
            createCustomer(customerRepository, userRepository, "cus@example.com", CustomerRole.STANDARD);

            // Create Tesla products
            if (productRepository.count() == 0) {
                createProduct(productRepository, "Model S", "Tesla Model S - Luxury Electric Sedan", TeslaModel.MODEL_S.name(), now);
                createProduct(productRepository, "Model 3", "Tesla Model 3 - Mid-size Electric Sedan", TeslaModel.MODEL_3.name(), now);
                createProduct(productRepository, "Model X", "Tesla Model X - Luxury Electric SUV", TeslaModel.MODEL_X.name(), now);
                createProduct(productRepository, "Model Y", "Tesla Model Y - Compact Electric SUV", TeslaModel.MODEL_Y.name(), now);
                createProduct(productRepository, "Cybertruck", "Tesla Cybertruck - Electric Pickup Truck", TeslaModel.CYBERTRUCK.name(), now);
            }

            // Create ticket types
            if (ticketTypeRepository.count() == 0) {
                createTicketType(ticketTypeRepository, "Technical Support", "Technical support and troubleshooting tickets");
                createTicketType(ticketTypeRepository, "General Inquiry", "General questions and information requests");
            }

          
        };
    }

    private void createManagerUser(String name, String email, TeslaModel category, 
                                 UserRepository userRepository, PasswordEncoder passwordEncoder, 
                                 LocalDateTime now) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("password123"));
            user.setRole(UserRole.MANAGER.name());
            user.setCreatedAt(now);
            userRepository.save(user);
        }
    }

    private void createEngineerUser(String name, String email, TeslaModel category, int level,
                                  UserRepository userRepository, PasswordEncoder passwordEncoder,
                                  LocalDateTime now) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("password123"));
            user.setRole(UserRole.ENGINEER.name());
            user.setCreatedAt(now);
            userRepository.save(user);
        }
    }

    private void createCustomerUser(String name, String email, CustomerRole role,
                                  UserRepository userRepository, PasswordEncoder passwordEncoder,
                                  LocalDateTime now) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("password123"));
            user.setRole(UserRole.CUSTOMER.name());
            user.setCreatedAt(now);
            userRepository.save(user);
        }
    }

    private void createManager(ManagerRepository managerRepository, UserRepository userRepository, 
                             String email, String department, String category) {
        if (!managerRepository.existsByEmail(email)) {
            User user = userRepository.findByEmail(email);
            if (user != null) {
                Manager manager = new Manager();
                manager.setUser(user);
                manager.setEmail(email);
                manager.setDepartment(department);
                manager.setCategory(TeslaModel.valueOf(category));
                managerRepository.save(manager);
            }
        }
    }

    private void createEngineer(EngineerRepository engineerRepository, UserRepository userRepository, 
                              String email, String category, int level, int maxTickets) {
        if (!engineerRepository.existsByEmail(email)) {
            User user = userRepository.findByEmail(email);
            if (user != null) {
                Engineer engineer = new Engineer();
                engineer.setUser(user);
                engineer.setEmail(email);
                engineer.setCategory(TeslaModel.valueOf(category));
                engineer.setLevel(level);
                engineer.setMaxTickets(maxTickets);
                engineer.setCurrentTickets(0);
                engineerRepository.save(engineer);
            }
        }
    }

    private void createCustomer(CustomerRepository customerRepository, UserRepository userRepository, 
                              String email, CustomerRole role) {
        if (!customerRepository.existsByEmail(email)) {
            User user = userRepository.findByEmail(email);
            if (user != null) {
                Customer customer = new Customer();
                customer.setUser(user);
                customer.setEmail(email);
                customer.setRole(role.name());
                customerRepository.save(customer);
            }
        }
    }

    private void createProduct(ProductRepository productRepository, String name, String description, String category, LocalDateTime now) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setCategory(category);
        product.setCreatedAt(now);
        productRepository.save(product);
    }

    private void createTicketType(TicketTypeRepository ticketTypeRepository, String name, String description) {
        TicketType type = new TicketType();
        type.setName(name);
        type.setDescription(description);
        ticketTypeRepository.save(type);
    }
} 