package com.tradevault.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_facilities")
public class CreditFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private CorporateClient client;

    @Column(name = "facility_type", nullable = false, length = 50)
    private String facilityType; // TERM_LOAN, REVOLVING_LINE, LETTER_OF_CREDIT_FACILITY, GUARANTEE_FACILITY

    @Column(name = "limit_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "utilized_amount", precision = 15, scale = 2)
    private BigDecimal utilizedAmount = BigDecimal.ZERO;

    @Column(length = 3)
    private String currency = "USD";

    @Column(length = 30)
    private String status = "ACTIVE";

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public CreditFacility() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CorporateClient getClient() { return client; }
    public void setClient(CorporateClient client) { this.client = client; }

    public String getFacilityType() { return facilityType; }
    public void setFacilityType(String facilityType) { this.facilityType = facilityType; }

    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }

    public BigDecimal getUtilizedAmount() { return utilizedAmount; }
    public void setUtilizedAmount(BigDecimal utilizedAmount) { this.utilizedAmount = utilizedAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
