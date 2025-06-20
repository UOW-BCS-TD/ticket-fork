package com.Elvis.ticket.controller;

import com.Elvis.ticket.dto.PasswordResetRequest;
import com.Elvis.ticket.dto.PasswordResetConfirmRequest;
import com.Elvis.ticket.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    @Autowired
    private UserService userService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody PasswordResetRequest request) {
        try {
            userService.requestPasswordReset(request.getEmail());
            return ResponseEntity.ok().body("Password reset email sent if the email exists");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetConfirmRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok().body("Password has been reset successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 