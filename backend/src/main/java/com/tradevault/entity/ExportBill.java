package com.tradevault.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "export_bills")
public class ExportBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private CorporateClient client;

    @Column(name = "bill_number", unique = true, nullable = false, length = 50)
    private String billNumber;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency = "USD";

    @Column(length = 30)
    private String status = "INITIATED"; // INITIATED, DOCUMENTS_SENT, ACCEPTED, PAID, OVERDUE

    @Column(name = "drawer_name", nullable = false, length = 150)
    private String drawerName;

    @Column(name = "drawee_name", nullable = false, length = 150)
    private String draweeName;

    @Column(name = "maturity_date", nullable = false)
    private LocalDate maturityDate;

    @Column(name = "collection_bank", nullable = false, length = 150)
    private String collectionBank;

    @Column(name = "tracking_status", length = 100)
    private String trackingStatus = "DOCUMENTS_PREPARED";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ExportBill() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CorporateClient getClient() { return client; }
    public void setClient(CorporateClient client) { this.client = client; }

    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDrawerName() { return drawerName; }
    public void setDrawerName(String drawerName) { this.drawerName = drawerName; }

    public String getDraweeName() { return draweeName; }
    public void setDraweeName(String draweeName) { this.draweeName = draweeName; }

    public LocalDate getMaturityDate() { return maturityDate; }
    public void setMaturityDate(LocalDate maturityDate) { this.maturityDate = maturityDate; }

    public String getCollectionBank() { return collectionBank; }
    public void setCollectionBank(String collectionBank) { this.collectionBank = collectionBank; }

    public String getTrackingStatus() { return trackingStatus; }
    public void setTrackingStatus(String trackingStatus) { this.trackingStatus = trackingStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
