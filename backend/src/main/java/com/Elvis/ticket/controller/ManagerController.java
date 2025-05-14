package com.Elvis.ticket.controller;

import com.Elvis.ticket.model.Manager;
import com.Elvis.ticket.model.TeslaModel;
import com.Elvis.ticket.service.ManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/managers")
public class ManagerController {

    private final ManagerService managerService;

    public ManagerController(ManagerService managerService) {
        this.managerService = managerService;
    }

    @PostMapping
    public ResponseEntity<Manager> createManager(@RequestBody Manager manager) {
        return ResponseEntity.ok(managerService.createManager(manager));
    }

    @GetMapping
    public ResponseEntity<List<Manager>> getAllManagers() {
        return ResponseEntity.ok(managerService.getAllManagers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Manager> getManagerById(@PathVariable Long id) {
        return managerService.getManagerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Manager> getManagerByEmail(@PathVariable String email) {
        Manager manager = managerService.getManagerByEmail(email);
        return manager != null ? ResponseEntity.ok(manager) : ResponseEntity.notFound().build();
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<Manager>> getManagersByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(managerService.getManagersByDepartment(department));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Manager>> getManagersByCategory(@PathVariable TeslaModel category) {
        return ResponseEntity.ok(managerService.getManagersByCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Manager> updateManager(@PathVariable Long id, @RequestBody Manager manager) {
        try {
            return ResponseEntity.ok(managerService.updateManager(id, manager));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManager(@PathVariable Long id) {
        managerService.deleteManager(id);
        return ResponseEntity.ok().build();
    }
} 