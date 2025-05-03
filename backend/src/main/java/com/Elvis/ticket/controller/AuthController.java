package com.Elvis.ticket.controller;

import com.Elvis.ticket.model.User;
import com.Elvis.ticket.security.JwtResponse;
import com.Elvis.ticket.service.AuthService;
import com.Elvis.ticket.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            String token = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            User user = userRepository.findByEmail(loginRequest.getEmail());
            String[] roles = new String[]{"ROLE_" + user.getRole()};
            return ResponseEntity.ok(new JwtResponse(token, "Bearer", user.getId(), loginRequest.getEmail(), roles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User signUpRequest) {
        try {
            User user = authService.register(signUpRequest);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 