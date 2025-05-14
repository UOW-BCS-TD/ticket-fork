package com.Elvis.ticket.controller;

import com.Elvis.ticket.dto.LoginRequest;
import com.Elvis.ticket.dto.UserResponseDTO;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.security.JwtResponse;
import com.Elvis.ticket.service.AuthService;
import com.Elvis.ticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.authenticate(request.getEmail(), request.getPassword());
            User user = userRepository.findByEmail(request.getEmail());
            String[] roles = new String[]{"ROLE_" + user.getRole()};
            return ResponseEntity.ok(new JwtResponse(token, "Bearer", user.getId(), request.getEmail(), roles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            UserResponseDTO registeredUser = authService.register(user);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 