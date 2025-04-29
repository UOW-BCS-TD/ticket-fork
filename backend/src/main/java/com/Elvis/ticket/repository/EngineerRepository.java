package com.Elvis.ticket.repository;

import com.Elvis.ticket.model.Engineer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EngineerRepository extends JpaRepository<Engineer, Long> {
    List<Engineer> findByCategory(String category);
    List<Engineer> findByCurrentTicketCountLessThan(Integer maxTickets);
    Engineer findByEmail(String email);
} 