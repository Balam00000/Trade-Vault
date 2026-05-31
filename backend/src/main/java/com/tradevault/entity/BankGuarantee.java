package com.tradevault.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_guarantees")
public class BankGuarantee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private CorporateClient client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "credit_facility_id", nullable = false)
    private CreditFacility creditFacility;

    @Column(name = "bg_number", unique = true, nullable = false, length = 50)
    private String bgNumber;

    @Column(name = "bg_type", nullable = false, length = 30)
    private String bgType; // BID_BOND, PERFORMANCE_BOND, ADVANCE_PAYMENT, FINANCIAL

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency = "USD";

    @Column(name = "beneficiary_name", nullable = false, length = 150)
    private String beneficiaryName;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(length = 30)
    private String status = "DRAFT"; // DRAFT, PENDING_APPROVAL, ACTIVE, CLAIMED, EXPIRED, RELEASED

    @Column(name = "terms_conditions", columnDefinition = "TEXT")
    private String termsConditions;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public BankGuarantee() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CorporateClient getClient() { return client; }
    public void setClient(CorporateClient client) { this.client = client; }

    public CreditFacility getCreditFacility() { return creditFacility; }
    public void setCreditFacility(CreditFacility creditFacility) { this.creditFacility = creditFacility; }

    public String getBgNumber() { return bgNumber; }
    public void setBgNumber(String bgNumber) { this.bgNumber = bgNumber; }

    public String getBgType() { return bgType; }
    public void setBgType(String bgType) { this.bgType = bgType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getBeneficiaryName() { return beneficiaryName; }
    public void setBeneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTermsConditions() { return termsConditions; }
    public void setTermsConditions(String termsConditions) { this.termsConditions = termsConditions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
