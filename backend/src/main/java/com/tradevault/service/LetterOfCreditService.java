package com.tradevault.service;

import com.tradevault.entity.*;
import com.tradevault.exception.BadRequestException;
import com.tradevault.exception.ResourceNotFoundException;
import com.tradevault.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LetterOfCreditService {

    @Autowired
    private LetterOfCreditRepository lcRepository;

    @Autowired
    private CreditFacilityRepository facilityRepository;

    @Autowired
    private CorporateClientRepository clientRepository;

    @Autowired
    private LCAmendmentRepository amendmentRepository;

    @Autowired
    private LCDrawingRepository drawingRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private SanctionsScreeningService sanctionsScreeningService;

    @Autowired
    private SanctionsScreeningRepository sanctionsScreeningRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public List<LetterOfCredit> getAllLCs() {
        return lcRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<LetterOfCredit> getLCsByClientId(Long clientId) {
        return lcRepository.findByClientId(clientId);
    }

    public LetterOfCredit getLCById(Long id) {
        return lcRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Letter of Credit not found with id: " + id));
    }

    @Transactional
    public LetterOfCredit createLC(LetterOfCredit lc, Long clientId, Long facilityId, String username) {
        CorporateClient client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Corporate Client not found"));
        CreditFacility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit Facility not found"));

        if (!facility.getClient().getId().equals(client.getId())) {
            throw new BadRequestException("Credit facility does not belong to the selected client");
        }

        // Limit Check for LC
        BigDecimal availableLimit = facility.getLimitAmount().subtract(facility.getUtilizedAmount());
        if (lc.getAmount().compareTo(availableLimit) > 0) {
            throw new BadRequestException("Insufficient credit facility limit. Available: " + availableLimit + " USD");
        }

        lc.setClient(client);
        lc.setCreditFacility(facility);
        lc.setIssueDate(LocalDate.now());
        lc.setStatus("DRAFT");

        if (lc.getLcNumber() == null || lc.getLcNumber().trim().isEmpty()) {
            lc.setLcNumber("LC-" + LocalDate.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000)));
        }

        LetterOfCredit savedLC = lcRepository.save(lc);

        auditLogService.log(null, username, "LC_CREATION_DRAFT", 
                "Created LC Draft: " + savedLC.getLcNumber() + " for " + savedLC.getAmount() + " " + savedLC.getCurrency(), null);

        // Sanctions screening trigger
        sanctionsScreeningService.screenEntity(lc.getApplicantName(), "APPLICANT", "LC", savedLC.getLcNumber());
        sanctionsScreeningService.screenEntity(lc.getBeneficiaryName(), "BENEFICIARY", "LC", savedLC.getLcNumber());

        return savedLC;
    }

    @Transactional
    public LetterOfCredit updateStatus(Long id, String status, String username) {
        LetterOfCredit lc = getLCById(id);
        String oldStatus = lc.getStatus();

        // 🔒 COMPLIANCE HOLD: block if FLAGGED screening exists for this LC
        boolean hasComplianceHold = !sanctionsScreeningRepository
                .findByTransactionIdAndStatus(lc.getLcNumber(), "FLAGGED").isEmpty();
        if (hasComplianceHold) {
            auditLogService.log(null, username, "COMPLIANCE_HOLD_BLOCKED",
                    "Blocked status update on LC " + lc.getLcNumber() + " — open compliance hold (FLAGGED screening). Resolve via Compliance module first.", null);
            throw new IllegalStateException(
                    "COMPLIANCE_HOLD: Letter of Credit '" + lc.getLcNumber() + "' has an unresolved sanctions screening flag. " +
                    "A Compliance Manager must clear or block this entity before status can be advanced.");
        }

        lc.setStatus(status);

        // If transitioning to ACTIVE (meaning approved by Operations/Checker), block the facility limit!
        if ("ACTIVE".equals(status) && !"ACTIVE".equals(oldStatus) && !"AMENDED".equals(oldStatus)) {
            CreditFacility facility = lc.getCreditFacility();
            BigDecimal available = facility.getLimitAmount().subtract(facility.getUtilizedAmount());
            if (lc.getAmount().compareTo(available) > 0) {
                throw new BadRequestException("Cannot activate LC: Facility limit exceeded. Available: " + available);
            }
            facility.setUtilizedAmount(facility.getUtilizedAmount().add(lc.getAmount()));
            facilityRepository.save(facility);
            
            // Create notification for client
            notificationRepository.save(new Notification(
                    lc.getClient().getId(), 
                    "Letter of Credit Active", 
                    "Your Letter of Credit " + lc.getLcNumber() + " is now ACTIVE.", 
                    "INFO"
            ));
        }

        LetterOfCredit updated = lcRepository.save(lc);
        auditLogService.log(null, username, "LC_STATUS_UPDATE",
                "Updated LC status: " + lc.getLcNumber() + " from " + oldStatus + " to " + status, null);

        return updated;
    }

    // LCAmendment logic
    @Transactional
    public LCAmendment requestAmendment(Long lcId, BigDecimal newAmount, LocalDate newExpiryDate, String justification, String username) {
        LetterOfCredit lc = getLCById(lcId);
        
        LCAmendment amendment = new LCAmendment();
        amendment.setLc(lc);
        amendment.setPreviousAmount(lc.getAmount());
        amendment.setNewAmount(newAmount);
        amendment.setPreviousExpiryDate(lc.getExpiryDate());
        amendment.setNewExpiryDate(newExpiryDate);
        amendment.setJustification(justification);
        amendment.setCreatedBy(username);
        amendment.setStatus("PENDING_APPROVAL");

        // Set amendment number
        List<LCAmendment> amendments = amendmentRepository.findByLcIdOrderByAmendmentNumberDesc(lcId);
        int num = amendments.isEmpty() ? 1 : amendments.get(0).getAmendmentNumber() + 1;
        amendment.setAmendmentNumber(num);

        return amendmentRepository.save(amendment);
    }

    @Transactional
    public LCAmendment processAmendment(Long amendmentId, String status, String username) {
        LCAmendment amendment = amendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Amendment not found"));
        
        amendment.setStatus(status);
        LCAmendment saved = amendmentRepository.save(amendment);

        if ("APPROVED".equals(status)) {
            LetterOfCredit lc = amendment.getLc();
            BigDecimal diff = amendment.getNewAmount().subtract(amendment.getPreviousAmount());
            
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                // Check limit for increase
                CreditFacility facility = lc.getCreditFacility();
                BigDecimal available = facility.getLimitAmount().subtract(facility.getUtilizedAmount());
                if (diff.compareTo(available) > 0) {
                    throw new BadRequestException("Cannot approve amendment: Insufficient facility limit for the increase of " + diff + " USD");
                }
                facility.setUtilizedAmount(facility.getUtilizedAmount().add(diff));
                facilityRepository.save(facility);
            } else if (diff.compareTo(BigDecimal.ZERO) < 0) {
                // Refund the limit for decrease
                CreditFacility facility = lc.getCreditFacility();
                facility.setUtilizedAmount(facility.getUtilizedAmount().add(diff)); // diff is negative, so it subtracts
                facilityRepository.save(facility);
            }

            lc.setAmount(amendment.getNewAmount());
            lc.setExpiryDate(amendment.getNewExpiryDate());
            lc.setStatus("AMENDED");
            lcRepository.save(lc);

            auditLogService.log(null, username, "LC_AMENDMENT_APPROVED", 
                    "Approved Amendment #" + amendment.getAmendmentNumber() + " for LC: " + lc.getLcNumber() + ". New Amount: " + lc.getAmount(), null);
        } else {
            auditLogService.log(null, username, "LC_AMENDMENT_REJECTED", 
                    "Rejected Amendment #" + amendment.getAmendmentNumber() + " for LC: " + amendment.getLc().getLcNumber(), null);
        }

        return saved;
    }

    // LCDrawing logic
    @Transactional
    public LCDrawing presentDrawing(Long lcId, BigDecimal amount, String documents, String username) {
        LetterOfCredit lc = getLCById(lcId);
        
        LCDrawing drawing = new LCDrawing();
        drawing.setLc(lc);
        drawing.setDrawingRef("DRW-" + lc.getLcNumber() + "-" + System.currentTimeMillis() % 10000);
        drawing.setAmount(amount);
        drawing.setPresentationDate(LocalDate.now());
        drawing.setDocumentsPresented(documents);
        drawing.setStatus("PENDING_REVIEW");

        // Check discrepancy: simulate standard documentary checks
        if (!documents.toUpperCase().contains("BILL OF LADING") || !documents.toUpperCase().contains("INVOICE")) {
            drawing.setStatus("DISCREPANT");
            drawing.setDiscrepancyNotes("Missing required document: Bill of Lading or Commercial Invoice in the presentation.");
        }

        return drawingRepository.save(drawing);
    }

    @Transactional
    public LCDrawing processDrawing(Long drawingId, String status, String discrepancyNotes, String username) {
        LCDrawing drawing = drawingRepository.findById(drawingId)
                .orElseThrow(() -> new ResourceNotFoundException("Drawing not found"));
        
        drawing.setStatus(status);
        if (discrepancyNotes != null) {
            drawing.setDiscrepancyNotes(discrepancyNotes);
        }

        if ("PAID".equals(status)) {
            // Payout: release from utilized limit
            LetterOfCredit lc = drawing.getLc();
            CreditFacility facility = lc.getCreditFacility();
            
            BigDecimal releaseAmount = drawing.getAmount().min(facility.getUtilizedAmount());
            facility.setUtilizedAmount(facility.getUtilizedAmount().subtract(releaseAmount));
            facilityRepository.save(facility);
            
            lc.setStatus("DRAWN");
            lcRepository.save(lc);

            auditLogService.log(null, username, "LC_DRAWING_PAID", 
                    "Paid drawing " + drawing.getDrawingRef() + " of " + drawing.getAmount() + " USD. Released limit.", null);
        }

        return drawingRepository.save(drawing);
    }

    public List<LCAmendment> getAmendments(Long lcId) {
        return amendmentRepository.findByLcIdOrderByAmendmentNumberDesc(lcId);
    }

    public List<LCDrawing> getDrawings(Long lcId) {
        return drawingRepository.findByLcIdOrderByPresentationDateDesc(lcId);
    }
}
  