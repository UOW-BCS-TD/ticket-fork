package com.Elvis.ticket.service;

import com.Elvis.ticket.model.Engineer;
import com.Elvis.ticket.repository.EngineerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EngineerService {
    private final EngineerRepository engineerRepository;

    @Autowired
    public EngineerService(EngineerRepository engineerRepository) {
        this.engineerRepository = engineerRepository;
    }

    public List<Engineer> getAllEngineers() {
        return engineerRepository.findAll();
    }

    public Optional<Engineer> getEngineerById(Long id) {
        return engineerRepository.findById(id);
    }

    public Engineer getEngineerByEmail(String email) {
        return engineerRepository.findByEmail(email);
    }

    public List<Engineer> getEngineersByCategory(String category) {
        return engineerRepository.findByCategory(category);
    }

    public List<Engineer> getAvailableEngineers() {
        return engineerRepository.findByCurrentTicketCountLessThan(5);
    }

    public Engineer createEngineer(Engineer engineer) {
        return engineerRepository.save(engineer);
    }

    public Engineer updateEngineer(Long id, Engineer engineerDetails) {
        return engineerRepository.findById(id)
                .map(engineer -> {
                    engineer.setCategory(engineerDetails.getCategory());
                    engineer.setLevel(engineerDetails.getLevel());
                    engineer.setCurrentTicketCount(engineerDetails.getCurrentTicketCount());
                    return engineerRepository.save(engineer);
                })
                .orElseThrow(() -> new RuntimeException("Engineer not found with id: " + id));
    }

    public void deleteEngineer(Long id) {
        engineerRepository.deleteById(id);
    }

    public void incrementTicketCount(Long id) {
        engineerRepository.findById(id)
                .ifPresent(engineer -> {
                    if (engineer.getCurrentTicketCount() < engineer.getMaxTicketCount()) {
                        engineer.setCurrentTicketCount(engineer.getCurrentTicketCount() + 1);
                        engineerRepository.save(engineer);
                    }
                });
    }

    public void decrementTicketCount(Long id) {
        engineerRepository.findById(id)
                .ifPresent(engineer -> {
                    if (engineer.getCurrentTicketCount() > 0) {
                        engineer.setCurrentTicketCount(engineer.getCurrentTicketCount() - 1);
                        engineerRepository.save(engineer);
                    }
                });
    }
} 