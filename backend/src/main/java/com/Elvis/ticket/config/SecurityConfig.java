package com.Elvis.ticket.config;

import com.Elvis.ticket.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/").permitAll()
                
                // User profile endpoint
                .requestMatchers("/api/users/profile").authenticated()
                
                // User management endpoints (admin only)
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                
                // Ticket endpoints
                .requestMatchers("/api/tickets").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/tickets/{id}").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/tickets/customer/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/tickets/engineer/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/status/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/urgency/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/product/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/type/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/{id}/escalate").hasAnyRole("ADMIN", "MANAGER")
                
                // Customer management endpoints
                .requestMatchers("/api/customers").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/customers/{id}").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/customers/email/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/customers/{id}/role").hasRole("ADMIN")
                
                // Engineer management endpoints
                .requestMatchers("/api/engineers").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/engineers/{id}").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/engineers/email/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/engineers/category/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/engineers/available").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/engineers/create").hasAnyRole("ADMIN", "MANAGER")
                
                // Session management endpoints
                .requestMatchers("/api/sessions").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/sessions/{id}").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/sessions/session/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/sessions/user/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/sessions/inactive").hasRole("ADMIN")
                .requestMatchers("/api/sessions/{id}/end").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/sessions/{id}/activity").hasAnyRole("ADMIN", "MANAGER")
                
                // Any other request needs to be authenticated
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 