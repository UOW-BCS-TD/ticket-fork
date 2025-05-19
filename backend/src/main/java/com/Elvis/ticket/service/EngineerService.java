package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Engineer;
import com.Elvis.ticket.model.User;
import com.Elvis.ticket.model.TeslaModel;
import com.Elvis.ticket.repository.EngineerRepository;
import com.Elvis.ticket.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import com.Elvis.ticket.dto.CreateEngineerRequest;

@Service
public class EngineerService {

    private final EngineerRepository engineerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EngineerService(EngineerRepository engineerRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.engineerRepository = engineerRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Engineer createEngineer(Engineer engineer) {
        User user = userRepository.findByEmail(engineer.getEmail());
        if (user == null) {
            throw new RuntimeException("User not found with email: " + engineer.getEmail());
        }
        engineer.setUser(user);
        return engineerRepository.save(engineer);
    }

    @Transactional
    public Engineer createEngineerWithUser(CreateEngineerRequest req) {
        // 1. Create User
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode("changeme123"));
        user.setRole("ENGINEER");
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        // 2. Create Engineer
        Engineer engineer = new Engineer();
        engineer.setUser(user);
        engineer.setEmail(req.getEmail());
        engineer.setCategory(req.getCategory());
        engineer.setLevel(req.getLevel());
        engineer.setMaxTickets(req.getMaxTickets());
        engineer.setCurrentTickets(0);
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
    public List<Engineer> getEngineersByLevel(int level) {
        return engineerRepository.findByLevel(level);
    }

    @Transactional(readOnly = true)
    public List<Engineer> getEngineersByCategory(TeslaModel category) {
        return engineerRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<Engineer> getAvailableEngineers() {
        return engineerRepository.findByCurrentTicketsLessThanMaxTickets();
    }

    @Transactional(readOnly = true)
    public List<Engineer> getAvailableEngineersByCategory(TeslaModel category) {
        return engineerRepository.findByCategoryAndCurrentTicketsLessThanMaxTickets(category);
    }

    @Transactional
    public Engineer updateEngineer(Long id, Engineer engineerDetails) {
        return engineerRepository.findById(id)
                .map(existingEngineer -> {
                    existingEngineer.setCategory(engineerDetails.getCategory());
                    existingEngineer.setLevel(engineerDetails.getLevel());
                    existingEngineer.setMaxTickets(engineerDetails.getMaxTickets());
                    existingEngineer.setCurrentTickets(engineerDetails.getCurrentTickets());
                    return engineerRepository.save(existingEngineer);
                })
                .orElseThrow(() -> new RuntimeException("Engineer not found"));
    }

    @Transactional
    public void deleteEngineer(Long id) {
        engineerRepository.deleteById(id);
    }

    @Transactional
    public void incrementCurrentTickets(Long id) {
        engineerRepository.findById(id).ifPresent(engineer -> {
            if (engineer.getCurrentTickets() < engineer.getMaxTickets()) {
                engineer.setCurrentTickets(engineer.getCurrentTickets() + 1);
                engineerRepository.save(engineer);
            } else {
                throw new RuntimeException("Engineer has reached maximum ticket limit");
            }
        });
    }

    @Transactional
    public void decrementCurrentTickets(Long id) {
        engineerRepository.findById(id).ifPresent(engineer -> {
            if (engineer.getCurrentTickets() > 0) {
                engineer.setCurrentTickets(engineer.getCurrentTickets() - 1);
                engineerRepository.save(engineer);
            }
        });
    }
} 