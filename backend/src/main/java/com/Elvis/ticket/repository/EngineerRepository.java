package com.Elvis.ticket.repository;

import com.Elvis.ticket.model.Engineer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EngineerRepository extends JpaRepository<Engineer, Long> {
    List<Engineer> findByCategoryAndLevelGreaterThan(String category, int level);
    
    @Query("SELECT e FROM Engineer e WHERE e.currentTickets < e.maxTickets")
    List<Engineer> findAvailableEngineers();
    
    List<Engineer> findByCategory(String category);
    Engineer findByEmail(String email);
    boolean existsByEmail(String email);
} 