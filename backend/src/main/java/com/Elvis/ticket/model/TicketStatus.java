package com.Elvis.ticket.model;

public enum TicketStatus {
    OPEN, // Ticket created, not yet assigned
    IN_PROGRESS, // Engineer assigned and working
    ESCALATED, // Escalation attempted but higher level engineer has max tickets
    RESOLVED, // Problem resolved, ticket taken off from engineer
    CLOSED // Last update > 7 days, ticket auto-closed, off engineer but visible to customer
} 