package com.Elvis.ticket.repository;

import com.Elvis.ticket.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Customer findByEmail(String email);
    Customer findByChatbotId(String chatbotId);
    List<Customer> findByRole(String role);
    boolean existsByEmail(String email);
} 