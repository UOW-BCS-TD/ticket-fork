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
                .requestMatchers("/api/users/**").hasAuthority("ROLE_ADMIN")

                // Log endpoints (admin only)
                .requestMatchers("/api/logs/**").hasAuthority("ROLE_ADMIN")
                
                // Ticket endpoints
                .requestMatchers(HttpMethod.POST, "/api/tickets").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/tickets").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/tickets/{id}").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/tickets/customer/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/tickets/urgency/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER")
                .requestMatchers("/api/tickets/product/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER")
                .requestMatchers("/api/tickets/type/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER")
                .requestMatchers("/api/tickets/{id}/escalate").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_ENGINEER")
                .requestMatchers(HttpMethod.POST, "/api/tickets/*/attachments").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/tickets/*/attachments").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/tickets/*/attachments/*").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/tickets/manager/category").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                
                // Customer management endpoints
                .requestMatchers("/api/customers").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/customers/{id}").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/customers/email/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/customers/{id}/role").hasAuthority("ROLE_ADMIN")
                
                // Engineer management endpoints
                .requestMatchers(HttpMethod.GET, "/api/engineers/available/category/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_ENGINEER", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/engineers/available").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers(HttpMethod.POST, "/api/engineers").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/engineers/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/engineers/{id}").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/engineers/email/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/engineers/category/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/engineers/create").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                
                // Session management endpoints
                .requestMatchers(HttpMethod.POST, "/api/sessions").hasAuthority("ROLE_CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/sessions").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/sessions/{id}").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_ENGINEER", "ROLE_CUSTOMER")
                .requestMatchers("/api/sessions/session/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/sessions/user/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/sessions/inactive").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/sessions/{id}/end").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/sessions/{id}/activity").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_ENGINEER", "ROLE_CUSTOMER")
                .requestMatchers("/api/sessions/*/history").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_ENGINEER", "ROLE_CUSTOMER")
                .requestMatchers("/api/sessions/list").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_ENGINEER", "ROLE_CUSTOMER")
                
                // Product endpoints
                .requestMatchers(HttpMethod.GET, "/api/products").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/products/{id}").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/products").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/products/{id}").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                // Ticket type endpoints
                .requestMatchers(HttpMethod.GET, "/api/ticket-types").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers(HttpMethod.GET, "/api/ticket-types/{id}").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CUSTOMER")
                .requestMatchers("/api/ticket-types").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                .requestMatchers("/api/ticket-types/{id}").hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")
                
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
            "http://172.24.80.1:5173",
            "http://43.228.124.29",
            "https://chat.elvificent.com"
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