package com.tradevault.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "letters_of_credit")
public class LetterOfCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private CorporateClient client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "credit_facility_id", nullable = false)
    private CreditFacility creditFacility;

    @Column(name = "lc_number", unique = true, nullable = false, length = 50)
    private String lcNumber;

    @Column(name = "lc_type", nullable = false, length = 30)
    private String lcType; // SIGHT, USANCE

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency = "USD";

    @Column(name = "applicant_name", nullable = false, length = 150)
    private String applicantName;

    @Column(name = "beneficiary_name", nullable = false, length = 150)
    private String beneficiaryName;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(length = 30)
    private String status = "DRAFT"; // DRAFT, IN_REVIEW, APPROVED, REJECTED, ACTIVE, AMENDED, DRAWN, EXPIRED, CLOSED

    @Column(name = "tolerance_percentage", precision = 5, scale = 2)
    private BigDecimal tolerancePercentage = BigDecimal.ZERO;

    @Column(name = "port_of_loading", length = 100)
    private String portOfLoading;

    @Column(name = "port_of_discharge", length = 100)
    private String portOfDischarge;

    @Column(name = "latest_shipment_date")
    private LocalDate latestShipmentDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LetterOfCredit() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CorporateClient getClient() { return client; }
    public void setClient(CorporateClient client) { this.client = client; }

    public CreditFacility getCreditFacility() { return creditFacility; }
    public void setCreditFacility(CreditFacility creditFacility) { this.creditFacility = creditFacility; }

    public String getLcNumber() { return lcNumber; }
    public void setLcNumber(String lcNumber) { this.lcNumber = lcNumber; }

    public String getLcType() { return lcType; }
    public void setLcType(String lcType) { this.lcType = lcType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getBeneficiaryName() { return beneficiaryName; }
    public void setBeneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getTolerancePercentage() { return tolerancePercentage; }
    public void setTolerancePercentage(BigDecimal tolerancePercentage) { this.tolerancePercentage = tolerancePercentage; }

    public String getPortOfLoading() { return portOfLoading; }
    public void setPortOfLoading(String portOfLoading) { this.portOfLoading = portOfLoading; }

    public String getPortOfDischarge() { return portOfDischarge; }
    public void setPortOfDischarge(String portOfDischarge) { this.portOfDischarge = portOfDischarge; }

    public LocalDate getLatestShipmentDate() { return latestShipmentDate; }
    public void setLatestShipmentDate(LocalDate latestShipmentDate) { this.latestShipmentDate = latestShipmentDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
