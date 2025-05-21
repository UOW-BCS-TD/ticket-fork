package com.Elvis.ticket.dto;

import com.Elvis.ticket.model.Customer;
import lombok.Data;

@Data
public class CustomerResponseDTO {
    private Long id;
    private String email;
    private String role;
    private UserResponseDTO user;

    public static CustomerResponseDTO fromCustomer(Customer customer) {
        CustomerResponseDTO dto = new CustomerResponseDTO();
        dto.setId(customer.getId());
        dto.setEmail(customer.getEmail());
        dto.setRole(customer.getRole());
        dto.setUser(UserResponseDTO.fromUser(customer.getUser()));
        return dto;
    }
} 