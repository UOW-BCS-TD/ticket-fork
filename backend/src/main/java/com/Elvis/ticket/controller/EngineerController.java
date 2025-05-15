package com.Elvis.ticket.controller;

import com.Elvis.ticket.model.Engineer;
import com.Elvis.ticket.model.TeslaModel;
import com.Elvis.ticket.service.EngineerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/engineers")
public class EngineerController {
    private final EngineerService engineerService;

    @Autowired
    public EngineerController(EngineerService engineerService) {
        this.engineerService = engineerService;
    }

    @GetMapping
    public ResponseEntity<List<Engineer>> getAllEngineers() {
        return ResponseEntity.ok(engineerService.getAllEngineers());
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

    @GetMapping("/level/{level}")
    public ResponseEntity<List<Engineer>> getEngineersByLevel(@PathVariable int level) {
        return ResponseEntity.ok(engineerService.getEngineersByLevel(level));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Engineer>> getEngineersByCategory(@PathVariable TeslaModel category) {
        return ResponseEntity.ok(engineerService.getEngineersByCategory(category));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Map<String, Object>>> getAvailableEngineers() {
        List<Engineer> engineers = engineerService.getAvailableEngineers();
        List<Map<String, Object>> result = engineers.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("category", e.getCategory());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/available/category/{category}")
    public ResponseEntity<List<Engineer>> getAvailableEngineersByCategory(@PathVariable TeslaModel category) {
        // Only return available engineers with level 1
        List<Engineer> all = engineerService.getAvailableEngineersByCategory(category);
        List<Engineer> level1 = all.stream().filter(e -> e.getLevel() == 1).toList();
        return ResponseEntity.ok(level1);
    }

    @PostMapping
    public ResponseEntity<Engineer> createEngineer(@RequestBody Engineer engineer) {
        return ResponseEntity.ok(engineerService.createEngineer(engineer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Engineer> updateEngineer(@PathVariable Long id, @RequestBody Engineer engineer) {
        try {
            return ResponseEntity.ok(engineerService.updateEngineer(id, engineer));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEngineer(@PathVariable Long id) {
        engineerService.deleteEngineer(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/increment-tickets")
    public ResponseEntity<Void> incrementCurrentTickets(@PathVariable Long id) {
        try {
            engineerService.incrementCurrentTickets(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/decrement-tickets")
    public ResponseEntity<Void> decrementCurrentTickets(@PathVariable Long id) {
        engineerService.decrementCurrentTickets(id);
        return ResponseEntity.ok().build();
    }
} 