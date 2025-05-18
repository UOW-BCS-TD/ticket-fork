package com.Elvis.ticket.config;

import com.Elvis.ticket.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

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
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/").permitAll()
                // Allow anyone to send a message to a ticket
                .requestMatchers(HttpMethod.POST, "/api/tickets/*/message").permitAll()
                
                // User profile endpoints
                .requestMatchers("/api/users/profile").authenticated()
                .requestMatchers("/api/users/profile/password").authenticated()
                
                // User management endpoints (admin only)
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                
                // Ticket endpoints
                .requestMatchers(HttpMethod.POST, "/api/tickets").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers(HttpMethod.POST, "/api/tickets/").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/tickets/{id}").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/tickets/customer/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/tickets/engineer/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/status/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/urgency/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/product/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/type/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER")
                .requestMatchers("/api/tickets/{id}/escalate").hasAnyRole("ADMIN", "MANAGER", "ENGINEER")
                .requestMatchers("/api/tickets").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers(HttpMethod.POST, "/api/tickets/*/attachments").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/tickets/*/attachments").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/tickets/*/attachments/*").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/tickets/manager/category").hasAnyRole("ADMIN", "MANAGER")
                
                // Customer management endpoints
                .requestMatchers("/api/customers").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/customers/{id}").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/customers/email/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/customers/{id}/role").hasRole("ADMIN")
                
                // Engineer management endpoints
                .requestMatchers(HttpMethod.GET, "/api/engineers/available/category/**").hasAnyRole("ADMIN", "ENGINEER", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/engineers/available").hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/engineers/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/engineers/{id}").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/engineers/email/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/engineers/category/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/engineers/create").hasAnyRole("ADMIN", "MANAGER")
                
                // Session management endpoints
                .requestMatchers(HttpMethod.POST, "/api/sessions").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/sessions").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/sessions/{id}").hasAnyRole("ADMIN", "MANAGER", "ENGINEER", "CUSTOMER")
                .requestMatchers("/api/sessions/session/**").hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/sessions/user/**").hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/sessions/inactive").hasRole("ADMIN")
                .requestMatchers("/api/sessions/{id}/end").hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/sessions/{id}/activity").hasAnyRole("ADMIN", "MANAGER", "ENGINEER", "CUSTOMER")
                .requestMatchers("/api/sessions/*/history").hasAnyRole("ADMIN", "MANAGER", "ENGINEER", "CUSTOMER")
                .requestMatchers("/api/sessions/list").hasAnyRole("ADMIN", "MANAGER", "ENGINEER", "CUSTOMER")
                
                // Product endpoints
                .requestMatchers(HttpMethod.GET, "/api/products").hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/products/{id}").hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/products").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/products/{id}").hasAnyRole("ADMIN", "MANAGER")
                // Ticket type endpoints
                .requestMatchers(HttpMethod.GET, "/api/ticket-types").hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/ticket-types/{id}").hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")
                .requestMatchers("/api/ticket-types").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers("/api/ticket-types/{id}").hasAnyRole("ADMIN", "MANAGER")
                
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://10.14.0.2:5173",
            "http://192.168.56.1:5173",
            "http://10.2.67.76:5173",
            "http://172.24.80.1:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 