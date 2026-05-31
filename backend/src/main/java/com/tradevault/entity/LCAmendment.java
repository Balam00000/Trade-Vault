package com.tradevault.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lc_amendments")
public class LCAmendment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lc_id", nullable = false)
    private LetterOfCredit lc;

    @Column(name = "amendment_number", nullable = false)
    private Integer amendmentNumber;

    @Column(name = "previous_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal previousAmount;

    @Column(name = "new_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal newAmount;

    @Column(name = "previous_expiry_date", nullable = false)
    private LocalDate previousExpiryDate;

    @Column(name = "new_expiry_date", nullable = false)
    private LocalDate newExpiryDate;

    @Column(length = 30)
    private String status = "PENDING_APPROVAL"; // PENDING_APPROVAL, APPROVED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String justification;

    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LCAmendment() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LetterOfCredit getLc() { return lc; }
    public void setLc(LetterOfCredit lc) { this.lc = lc; }

    public Integer getAmendmentNumber() { return amendmentNumber; }
    public void setAmendmentNumber(Integer amendmentNumber) { this.amendmentNumber = amendmentNumber; }

    public BigDecimal getPreviousAmount() { return previousAmount; }
    public void setPreviousAmount(BigDecimal previousAmount) { this.previousAmount = previousAmount; }

    public BigDecimal getNewAmount() { return newAmount; }
    public void setNewAmount(BigDecimal newAmount) { this.newAmount = newAmount; }

    public LocalDate getPreviousExpiryDate() { return previousExpiryDate; }
    public void setPreviousExpiryDate(LocalDate previousExpiryDate) { this.previousExpiryDate = previousExpiryDate; }

    public LocalDate getNewExpiryDate() { return newExpiryDate; }
    public void setNewExpiryDate(LocalDate newExpiryDate) { this.newExpiryDate = newExpiryDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
