package com.Elvis.ticket.service;

import com.Elvis.ticket.model.*;
import com.Elvis.ticket.repository.*;
import com.Elvis.ticket.security.JwtTokenProvider;
import com.Elvis.ticket.dto.UserResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepository;
    private final ManagerRepository managerRepository;
    private final EngineerRepository engineerRepository;

    public String authenticate(String email, String password) {
        log.debug("Attempting to authenticate user with email: {}", email);
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return jwtTokenProvider.generateToken(authentication);
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", email, e);
            throw new RuntimeException("Invalid credentials", e);
        }
    }

    @Transactional
    public UserResponseDTO register(User user) {
        log.debug("Registering new user with email: {}", user.getEmail());
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Set default role if not specified
        if (user.getRole() == null) {
            user.setRole(UserRole.CUSTOMER.name());
        }

        // Encode password and set creation time
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        // Save the user first
        User savedUser = userRepository.save(user);

        // Create role-specific entry based on user role
        switch (UserRole.valueOf(user.getRole())) {
            case CUSTOMER:
                Customer customer = new Customer();
                customer.setUser(savedUser);
                customer.setEmail(savedUser.getEmail());
                customer.setRole("STANDARD"); // Default customer role
                customerRepository.save(customer);
                log.debug("Created customer entry for user: {}", savedUser.getEmail());
                break;

            case MANAGER:
                Manager manager = new Manager();
                manager.setUser(savedUser);
                manager.setEmail(savedUser.getEmail());
                manager.setDepartment("GENERAL"); // Default department
                managerRepository.save(manager);
                log.debug("Created manager entry for user: {}", savedUser.getEmail());
                break;

            case ENGINEER:
                Engineer engineer = new Engineer();
                engineer.setUser(savedUser);
                engineer.setEmail(savedUser.getEmail());
                engineer.setCategory("GENERAL"); // Default category
                engineer.setLevel(1); // Default level
                engineer.setMaxTickets(5); // Default max tickets
                engineer.setCurrentTickets(0);
                engineerRepository.save(engineer);
                log.debug("Created engineer entry for user: {}", savedUser.getEmail());
                break;

            default:
                log.warn("No specific role table entry created for user: {}", savedUser.getEmail());
                break;
        }

        return UserResponseDTO.fromUser(savedUser);
    }
} 