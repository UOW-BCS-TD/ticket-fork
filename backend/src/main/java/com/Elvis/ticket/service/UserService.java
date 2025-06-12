package com.Elvis.ticket.service;

import com.Elvis.ticket.model.User;
import com.Elvis.ticket.repository.UserRepository;
import com.Elvis.ticket.dto.PasswordChangeRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import com.Elvis.ticket.model.PasswordResetToken;
import com.Elvis.ticket.repository.PasswordResetTokenRepository;
import com.Elvis.ticket.service.EmailService;
import java.util.UUID;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return Optional.ofNullable(userRepository.findByEmail(email));
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public Optional<User> updateUser(Long id, User userDetails) {
        System.out.println("Updating user with ID: " + id);
        System.out.println("Update data - Name: " + userDetails.getName());
        System.out.println("Update data - Phone: " + userDetails.getPhoneNumber());
        System.out.println("Update data - Password: " + userDetails.getPassword());
        
        return userRepository.findById(id)
                .map(existingUser -> {
                    System.out.println("Existing user - Name: " + existingUser.getName());
                    System.out.println("Existing user - Password: " + existingUser.getPassword());
                    
                    // Only update name if provided
                    if (userDetails.getName() != null) {
                        existingUser.setName(userDetails.getName());
                        System.out.println("Updating name to: " + userDetails.getName());
                    }
                    
                    // Only update phone number if provided
                    if (userDetails.getPhoneNumber() != null) {
                        existingUser.setPhoneNumber(userDetails.getPhoneNumber());
                        System.out.println("Updating phone to: " + userDetails.getPhoneNumber());
                    }
                    
                    // Only update email if provided
                    if (userDetails.getEmail() != null) {
                        existingUser.setEmail(userDetails.getEmail());
                        System.out.println("Updating email to: " + userDetails.getEmail());
                    }
                    
                    // Only update role if provided
                    if (userDetails.getRole() != null) {
                        existingUser.setRole(userDetails.getRole());
                        System.out.println("Updating role to: " + userDetails.getRole());
                    }
                    
                    // Only update password if explicitly provided and not empty
                    if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) {
                        existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                        System.out.println("Updating password");
                    } else {
                        System.out.println("Not updating password - not provided or empty");
                    }
                    
                    User savedUser = userRepository.save(existingUser);
                    System.out.println("Saved user - Name: " + savedUser.getName());
                    System.out.println("Saved user - Password: " + savedUser.getPassword());
                    return savedUser;
                });
    }

    @Transactional
    public boolean deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            return false;
        }
        userRepository.deleteById(id);
        return true;
    }

    @Transactional
    public User updatePassword(Long id, PasswordChangeRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get current authenticated user's role
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentRole = null;
        if (authentication != null && authentication.getAuthorities() != null && !authentication.getAuthorities().isEmpty()) {
            currentRole = authentication.getAuthorities().iterator().next().getAuthority();
        }
        boolean isAdminOrManager = "ROLE_ADMIN".equals(currentRole) || "ROLE_MANAGER".equals(currentRole);

        if (isAdminOrManager) {
            // Admin/Manager can reset password with only newPassword
            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                throw new RuntimeException("New password is required");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            return userRepository.save(user);
        } else {
            // Normal user must provide old and new password
            if (request.getOldPassword() == null || request.getNewPassword() == null) {
                throw new RuntimeException("Both old and new passwords are required");
            }
            // Verify old password
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            return userRepository.save(user);
        }
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            // Don't reveal that the email doesn't exist
            return;
        }

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser_Id(user.getId());

        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        // Send email
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.isExpired() || resetToken.isUsed()) {
            throw new RuntimeException("Token has expired or has already been used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
} 