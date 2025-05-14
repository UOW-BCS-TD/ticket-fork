package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Manager;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.model.TeslaModel;
import com.Elvis.ticket.repository.ManagerRepository;
import com.Elvis.ticket.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ManagerService {

    private final ManagerRepository managerRepository;
    private final UserRepository userRepository;

    public ManagerService(ManagerRepository managerRepository, UserRepository userRepository) {
        this.managerRepository = managerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Manager createManager(Manager manager) {
        User user = userRepository.findByEmail(manager.getEmail());
        if (user == null) {
            throw new RuntimeException("User not found with email: " + manager.getEmail());
        }
        manager.setUser(user);
        return managerRepository.save(manager);
    }

    @Transactional(readOnly = true)
    public List<Manager> getAllManagers() {
        return managerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Manager> getManagerById(Long id) {
        return managerRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Manager getManagerByEmail(String email) {
        return managerRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<Manager> getManagersByDepartment(String department) {
        return managerRepository.findByDepartment(department);
    }

    @Transactional(readOnly = true)
    public List<Manager> getManagersByCategory(TeslaModel category) {
        return managerRepository.findByCategory(category);
    }

    @Transactional
    public Manager updateManager(Long id, Manager managerDetails) {
        return managerRepository.findById(id)
                .map(existingManager -> {
                    existingManager.setDepartment(managerDetails.getDepartment());
                    existingManager.setCategory(managerDetails.getCategory());
                    return managerRepository.save(existingManager);
                })
                .orElseThrow(() -> new RuntimeException("Manager not found"));
    }

    @Transactional
    public void deleteManager(Long id) {
        managerRepository.deleteById(id);
    }
} 