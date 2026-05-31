package com.tradevault.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sanctions_screenings")
public class SanctionsScreening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_name", nullable = false, length = 150)
    private String entityName;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // APPLICANT, BENEFICIARY, BANK

    @Column(name = "transaction_type", nullable = false, length = 50)
    private String transactionType; // LC, BG, EXPORT_BILL

    @Column(name = "transaction_id", nullable = false, length = 50)
    private String transactionId;

    @Column(name = "match_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal matchScore;

    @Column(name = "watchlist_source", nullable = false, length = 100)
    private String watchlistSource; // OFAC, UN_SECURITY_COUNCIL, EU_WATCHLIST

    @Column(length = 30)
    private String status = "UNDER_REVIEW"; // CLEARED, FLAGGED, UNDER_REVIEW

    @Column(name = "screened_at", updatable = false)
    private LocalDateTime screenedAt = LocalDateTime.now();

    @Column(name = "compliance_notes", columnDefinition = "TEXT")
    private String complianceNotes;

    public SanctionsScreening() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public BigDecimal getMatchScore() { return matchScore; }
    public void setMatchScore(BigDecimal matchScore) { this.matchScore = matchScore; }

    public String getWatchlistSource() { return watchlistSource; }
    public void setWatchlistSource(String watchlistSource) { this.watchlistSource = watchlistSource; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getScreenedAt() { return screenedAt; }
    public void setScreenedAt(LocalDateTime screenedAt) { this.screenedAt = screenedAt; }

    public String getComplianceNotes() { return complianceNotes; }
    public void setComplianceNotes(String complianceNotes) { this.complianceNotes = complianceNotes; }
}
