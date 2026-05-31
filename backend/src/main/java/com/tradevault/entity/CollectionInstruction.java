package com.tradevault.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "collection_instructions")
public class CollectionInstruction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private CorporateClient client;

    @Column(name = "instruction_ref", unique = true, nullable = false, length = 50)
    private String instructionRef;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency = "USD";

    @Column(name = "tenure_type", nullable = false, length = 30)
    private String tenureType; // SIGHT, USANCE

    @Column(name = "drawee_name", nullable = false, length = 150)
    private String draweeName;

    @Column(length = 30)
    private String status = "PENDING"; // PENDING, PROCESSING, COLLECTED, RETURNED

    @Column(name = "instruction_details", columnDefinition = "TEXT")
    private String instructionDetails;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public CollectionInstruction() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CorporateClient getClient() { return client; }
    public void setClient(CorporateClient client) { this.client = client; }

    public String getInstructionRef() { return instructionRef; }
    public void setInstructionRef(String instructionRef) { this.instructionRef = instructionRef; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getTenureType() { return tenureType; }
    public void setTenureType(String tenureType) { this.tenureType = tenureType; }

    public String getDraweeName() { return draweeName; }
    public void setDraweeName(String draweeName) { this.draweeName = draweeName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getInstructionDetails() { return instructionDetails; }
    public void setInstructionDetails(String instructionDetails) { this.instructionDetails = instructionDetails; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
