package com.Elvis.ticket.repository;

import com.Elvis.ticket.model.Manager;
import com.Elvis.ticket.model.TeslaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, Long> {
    Manager findByEmail(String email);
    List<Manager> findByDepartment(String department);
    List<Manager> findByCategory(TeslaModel category);
    boolean existsByEmail(String email);
} 