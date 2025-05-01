package com.Elvis.ticket.repository;

import com.Elvis.ticket.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByUserId(Long userId);
    List<Session> findByEndTimeIsNull();
    List<Session> findByLastActivityBefore(LocalDateTime threshold);
} 