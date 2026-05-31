package com.tradevault.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lc_drawings")
public class LCDrawing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lc_id", nullable = false)
    private LetterOfCredit lc;

    @Column(name = "drawing_ref", unique = true, nullable = false, length = 50)
    private String drawingRef;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 3)
    private String currency = "USD";

    @Column(length = 30)
    private String status = "PENDING_REVIEW"; // PENDING_REVIEW, DISCREPANT, APPROVED, PAID, REJECTED

    @Column(name = "presentation_date", nullable = false)
    private LocalDate presentationDate;

    @Column(name = "documents_presented", columnDefinition = "TEXT")
    private String documentsPresented;

    @Column(name = "discrepancy_notes", columnDefinition = "TEXT")
    private String discrepancyNotes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LCDrawing() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LetterOfCredit getLc() { return lc; }
    public void setLc(LetterOfCredit lc) { this.lc = lc; }

    public String getDrawingRef() { return drawingRef; }
    public void setDrawingRef(String drawingRef) { this.drawingRef = drawingRef; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getPresentationDate() { return presentationDate; }
    public void setPresentationDate(LocalDate presentationDate) { this.presentationDate = presentationDate; }

    public String getDocumentsPresented() { return documentsPresented; }
    public void setDocumentsPresented(String documentsPresented) { this.documentsPresented = documentsPresented; }

    public String getDiscrepancyNotes() { return discrepancyNotes; }
    public void setDiscrepancyNotes(String discrepancyNotes) { this.discrepancyNotes = discrepancyNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
