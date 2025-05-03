package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Customer;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.model.CustomerRole;
import com.Elvis.ticket.repository.CustomerRepository;
import com.Elvis.ticket.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Customer createCustomer(Customer customer) {
        // Validate user exists
        User user = userRepository.findById(customer.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate customer role
        if (!isValidCustomerRole(customer.getRole())) {
            throw new RuntimeException("Invalid customer role. Must be one of: STANDARD, PREMIUM, VIP");
        }

        // Set the validated user
        customer.setUser(user);
        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email);
    }

    @Transactional
    public Customer updateCustomer(Long id, Customer customerDetails) {
        return customerRepository.findById(id)
                .map(existingCustomer -> {
                    existingCustomer.setRole(customerDetails.getRole());
                    return customerRepository.save(existingCustomer);
                })
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found");
        }
        customerRepository.deleteById(id);
    }

    @Transactional
    public Customer updateCustomerRole(Long id, CustomerRole role) {
        return customerRepository.findById(id)
                .map(customer -> {
                    if (!isValidCustomerRole(role.name())) {
                        throw new RuntimeException("Invalid customer role. Must be one of: STANDARD, PREMIUM, VIP");
                    }
                    customer.setRole(role.name());
                    return customerRepository.save(customer);
                })
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    private boolean isValidCustomerRole(String role) {
        try {
            CustomerRole.valueOf(role);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
} 