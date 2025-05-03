package com.Elvis.ticket.controller;

import com.Elvis.ticket.model.Engineer;
import com.Elvis.ticket.service.EngineerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/engineers")
public class EngineerController {
    private final EngineerService engineerService;

    @Autowired
    public EngineerController(EngineerService engineerService) {
        this.engineerService = engineerService;
    }

    @GetMapping
    public List<Engineer> getAllEngineers() {
        return engineerService.getAllEngineers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Engineer> getEngineerById(@PathVariable Long id) {
        return engineerService.getEngineerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Engineer> getEngineerByEmail(@PathVariable String email) {
        Engineer engineer = engineerService.getEngineerByEmail(email);
        return engineer != null ? ResponseEntity.ok(engineer) : ResponseEntity.notFound().build();
    }

    @GetMapping("/category/{category}")
    public List<Engineer> getEngineersByCategory(@PathVariable String category) {
        return engineerService.getEngineersByCategory(category);
    }

    @GetMapping("/available")
    public List<Engineer> getAvailableEngineers() {
        return engineerService.getAvailableEngineers();
    }

    @PostMapping
    public Engineer createEngineer(@RequestBody Engineer engineer) {
        return engineerService.createEngineer(engineer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Engineer> updateEngineer(@PathVariable Long id, @RequestBody Engineer engineerDetails) {
        try {
            Engineer updatedEngineer = engineerService.updateEngineer(id, engineerDetails);
            return ResponseEntity.ok(updatedEngineer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEngineer(@PathVariable Long id) {
        engineerService.deleteEngineer(id);
        return ResponseEntity.ok().build();
    }
} 