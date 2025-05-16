package com.Elvis.ticket.controller;

import com.Elvis.ticket.dto.UserResponse;
import com.Elvis.ticket.dto.PasswordChangeRequest;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.service.UserService;
import com.Elvis.ticket.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(UserResponse.fromUser(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.getUserByEmail(email)
                .map(user -> {
                    UserResponse response = UserResponse.fromUser(user);
                    if ("CUSTOMER".equals(user.getRole())) {
                        com.Elvis.ticket.model.Customer customer = customerRepository.findByEmail(email);
                        if (customer != null) {
                            response.setCustomerId(customer.getId());
                        }
                    }
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserResponse createUser(@RequestBody User user) {
        return UserResponse.fromUser(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user)
                .map(updatedUser -> ResponseEntity.ok(UserResponse.fromUser(updatedUser)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody PasswordChangeRequest request) {
        try {
            User updatedUser = userService.updatePassword(id, request);
            return ResponseEntity.ok(UserResponse.fromUser(updatedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> updateCurrentUserPassword(@RequestBody PasswordChangeRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            return userService.getUserByEmail(email)
                    .map(user -> {
                        User updatedUser = userService.updatePassword(user.getId(), request);
                        return ResponseEntity.ok(UserResponse.fromUser(updatedUser));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.deleteUser(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateCurrentUserProfile(@RequestBody User userDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        System.out.println("Received update request for user: " + email);
        System.out.println("Request data - Name: " + userDetails.getName());
        System.out.println("Request data - Phone: " + userDetails.getPhoneNumber());
        System.out.println("Request data - Password: " + userDetails.getPassword());
        
        return userService.getUserByEmail(email)
                .map(user -> {
                    // Create a new User object with only the fields we want to update
                    User updateData = new User();
                    updateData.setId(user.getId());
                    
                    // Only set fields that are provided in the request
                    if (userDetails.getName() != null) {
                        updateData.setName(userDetails.getName());
                    }
                    if (userDetails.getPhoneNumber() != null) {
                        updateData.setPhoneNumber(userDetails.getPhoneNumber());
                    }
                    
                    // Don't set any other fields - they will be ignored by the service
                    return ResponseEntity.ok(UserResponse.fromUser(userService.updateUser(user.getId(), updateData).orElse(user)));
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 