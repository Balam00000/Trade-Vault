package com.tradevault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "compliance_cases")
public class ComplianceCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "screening_id", nullable = false)
    private SanctionsScreening screening;

    @Column(name = "case_status", length = 30)
    private String caseStatus = "OPEN"; // OPEN, UNDER_INVESTIGATION, ESCALATED, RESOLVED_CLEARED, RESOLVED_BLOCKED

    @Column(name = "assigned_to", length = 50)
    private String assignedTo;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ComplianceCase() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SanctionsScreening getScreening() { return screening; }
    public void setScreening(SanctionsScreening screening) { this.screening = screening; }

    public String getCaseStatus() { return caseStatus; }
    public void setCaseStatus(String caseStatus) { this.caseStatus = caseStatus; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
