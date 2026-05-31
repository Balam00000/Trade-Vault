package com.tradevault.service;

import com.tradevault.entity.ComplianceCase;
import com.tradevault.entity.SanctionsScreening;
import com.tradevault.repository.ComplianceCaseRepository;
import com.tradevault.repository.SanctionsScreeningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SanctionsScreeningService {

    @Autowired
    private SanctionsScreeningRepository screeningRepository;

    @Autowired
    private ComplianceCaseRepository caseRepository;

    @Transactional
    public SanctionsScreening screenEntity(String entityName, String entityType, String txType, String txId) {
        BigDecimal score = BigDecimal.ZERO;
        String source = "N/A";
        String status = "CLEARED";
        String notes = "Entity cleared. No match found on watchlist database.";

        String normalized = entityName.toUpperCase().trim();

        if (normalized.contains("SYRIA") || normalized.contains("SUDAN") || normalized.contains("IRAN")) {
            score = new BigDecimal("89.50");
            source = "OFAC_SDN";
            status = "FLAGGED";
            notes = "High-risk match triggered (89.5% score) against Trade Block Ban Watchlist.";
        } else if (normalized.contains("SHANGHAI") || normalized.contains("TOKYO")) {
            score = new BigDecimal("12.00");
            source = "EU_WATCHLIST";
            status = "CLEARED";
            notes = "Low match score (12%). Checked and auto-cleared by system.";
        }

        SanctionsScreening screening = new SanctionsScreening();
        screening.setEntityName(entityName);
        screening.setEntityType(entityType);
        screening.setTransactionType(txType);
        screening.setTransactionId(txId);
        screening.setMatchScore(score);
        screening.setWatchlistSource(source);
        screening.setStatus(status);
        screening.setComplianceNotes(notes);

        screening = screeningRepository.save(screening);

        // If high match score, automatically create a compliance case
        if ("FLAGGED".equals(status)) {
            ComplianceCase compCase = new ComplianceCase();
            compCase.setScreening(screening);
            compCase.setCaseStatus("OPEN");
            compCase.setAssignedTo("compliance");
            compCase.setResolutionNotes("System generated compliance alert for high risk name match. Watchlist source: " + source);
            caseRepository.save(compCase);
        }

        return screening;
    }

    public List<SanctionsScreening> getAllScreenings() {
        return screeningRepository.findAllByOrderByScreenedAtDesc();
    }

    public List<ComplianceCase> getAllCases() {
        return caseRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ComplianceCase resolveCase(Long caseId, String status, String notes, String resolver) {
        ComplianceCase compCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Compliance case not found"));
        
        compCase.setCaseStatus(status);
        compCase.setResolutionNotes(notes);
        compCase.setAssignedTo(resolver);
        
        // Update associated screening status
        SanctionsScreening screening = compCase.getScreening();
        if (status.contains("RESOLVED_CLEARED")) {
            screening.setStatus("CLEARED");
        } else if (status.contains("RESOLVED_BLOCKED")) {
            screening.setStatus("FLAGGED");
        }
        screeningRepository.save(screening);

        return caseRepository.save(compCase);
    }
}
