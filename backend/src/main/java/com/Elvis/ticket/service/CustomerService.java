package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Customer;
import com.Elvis.ticket.model.User;
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
        User user = userRepository.findByEmail(customer.getEmail());
        if (user == null) {
            throw new RuntimeException("User not found with email: " + customer.getEmail());
        }
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
        customerRepository.deleteById(id);
    }

    @Transactional
    public Customer updateCustomerRole(Long id, CustomerRole role) {
        return customerRepository.findById(id)
                .map(customer -> {
                    customer.setRole(role.name());
                    return customerRepository.save(customer);
                })
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }
} 