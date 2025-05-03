package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Engineer;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.repository.EngineerRepository;
import com.Elvis.ticket.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EngineerService {

    private final EngineerRepository engineerRepository;
    private final UserRepository userRepository;

    public EngineerService(EngineerRepository engineerRepository, UserRepository userRepository) {
        this.engineerRepository = engineerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Engineer createEngineer(Engineer engineer) {
        // Validate user exists
        User user = userRepository.findById(engineer.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate engineer properties
        validateEngineerProperties(engineer);

        // Set the validated user
        engineer.setUser(user);
        return engineerRepository.save(engineer);
    }

    @Transactional(readOnly = true)
    public List<Engineer> getAllEngineers() {
        return engineerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Engineer> getEngineerById(Long id) {
        return engineerRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Engineer getEngineerByEmail(String email) {
        return engineerRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<Engineer> getEngineersByCategory(String category) {
        return engineerRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<Engineer> getAvailableEngineers() {
        return engineerRepository.findAvailableEngineers();
    }

    @Transactional
    public Engineer updateEngineer(Long id, Engineer engineerDetails) {
        return engineerRepository.findById(id)
                .map(existingEngineer -> {
                    // Validate user if changed
                    if (engineerDetails.getUser() != null && 
                        !engineerDetails.getUser().getId().equals(existingEngineer.getUser().getId())) {
                        User user = userRepository.findById(engineerDetails.getUser().getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                        existingEngineer.setUser(user);
                    }

                    // Update other fields
                    if (engineerDetails.getEmail() != null) {
                        existingEngineer.setEmail(engineerDetails.getEmail());
                    }
                    if (engineerDetails.getCategory() != null) {
                        existingEngineer.setCategory(engineerDetails.getCategory());
                    }
                    if (engineerDetails.getLevel() > 0) {
                        existingEngineer.setLevel(engineerDetails.getLevel());
                    }
                    if (engineerDetails.getMaxTickets() > 0) {
                        if (engineerDetails.getMaxTickets() < existingEngineer.getCurrentTickets()) {
                            throw new RuntimeException("Cannot set max tickets below current ticket count");
                        }
                        existingEngineer.setMaxTickets(engineerDetails.getMaxTickets());
                    }

                    validateEngineerProperties(existingEngineer);
                    return engineerRepository.save(existingEngineer);
                })
                .orElseThrow(() -> new RuntimeException("Engineer not found"));
    }

    @Transactional
    public void deleteEngineer(Long id) {
        if (!engineerRepository.existsById(id)) {
            throw new RuntimeException("Engineer not found");
        }
        engineerRepository.deleteById(id);
    }

    private void validateEngineerProperties(Engineer engineer) {
        if (engineer.getLevel() <= 0) {
            throw new RuntimeException("Engineer level must be greater than 0");
        }
        if (engineer.getMaxTickets() <= 0) {
            throw new RuntimeException("Max tickets must be greater than 0");
        }
        if (engineer.getCurrentTickets() < 0) {
            throw new RuntimeException("Current tickets cannot be negative");
        }
        if (engineer.getCurrentTickets() > engineer.getMaxTickets()) {
            throw new RuntimeException("Current tickets cannot exceed max tickets");
        }
    }

    @Transactional
    public List<Engineer> findHigherLevelEngineers(String category, int currentLevel) {
        return engineerRepository.findByCategoryAndLevelGreaterThan(category, currentLevel);
    }
} 