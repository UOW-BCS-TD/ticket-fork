package com.Elvis.ticket.repository;

import com.Elvis.ticket.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Session findBySessionId(String sessionId);
    List<Session> findByUserId(Long userId);
    List<Session> findByLastActivityBefore(java.time.LocalDateTime date);
} 