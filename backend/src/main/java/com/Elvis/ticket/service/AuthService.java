package com.Elvis.ticket.service;

import com.Elvis.ticket.model.User;
import com.Elvis.ticket.model.UserRole;
import com.Elvis.ticket.repository.UserRepository;
import com.Elvis.ticket.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

    public User register(User user) {
        log.debug("Registering new user with email: {}", user.getEmail());
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(UserRole.CUSTOMER.name());
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
} 