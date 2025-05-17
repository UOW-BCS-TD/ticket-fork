package com.Elvis.ticket.repository;

import com.Elvis.ticket.model.Engineer;
import com.Elvis.ticket.model.TeslaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EngineerRepository extends JpaRepository<Engineer, Long> {
    List<Engineer> findByCategoryAndLevelGreaterThan(TeslaModel category, int level);
    
    @Query("SELECT e FROM Engineer e WHERE e.currentTickets < e.maxTickets")
    List<Engineer> findAvailableEngineers();
    
    List<Engineer> findByCategory(TeslaModel category);
    Engineer findByEmail(String email);
    List<Engineer> findByLevel(int level);
    
    @Query("SELECT e FROM Engineer e WHERE e.currentTickets < e.maxTickets")
    List<Engineer> findByCurrentTicketsLessThanMaxTickets();
    
    @Query("SELECT e FROM Engineer e WHERE e.category = :category AND e.currentTickets < e.maxTickets")
    List<Engineer> findByCategoryAndCurrentTicketsLessThanMaxTickets(TeslaModel category);
    
    boolean existsByEmail(String email);
    
    List<Engineer> findByCategoryAndLevel(TeslaModel category, int level);
} 