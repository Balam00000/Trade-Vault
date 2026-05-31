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

@Service
public class BankGuaranteeService {

    @Autowired
    private BankGuaranteeRepository bgRepository;

    @Autowired
    private CreditFacilityRepository facilityRepository;

    @Autowired
    private CorporateClientRepository clientRepository;

    @Autowired
    private BGClaimRepository claimRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private SanctionsScreeningService sanctionsScreeningService;

    @Autowired
    private SanctionsScreeningRepository sanctionsScreeningRepository;

    public List<BankGuarantee> getAllBGs() {
        return bgRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<BankGuarantee> getBGsByClientId(Long clientId) {
        return bgRepository.findByClientId(clientId);
    }

    public BankGuarantee getBGById(Long id) {
        return bgRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank Guarantee not found with id: " + id));
    }

    @Transactional
    public BankGuarantee createBG(BankGuarantee bg, Long clientId, Long facilityId, String username) {
        CorporateClient client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Corporate Client not found"));
        CreditFacility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit Facility not found"));

        if (!facility.getClient().getId().equals(client.getId())) {
            throw new BadRequestException("Credit facility does not belong to the selected client");
        }

        // Limit Check for BG
        BigDecimal availableLimit = facility.getLimitAmount().subtract(facility.getUtilizedAmount());
        if (bg.getAmount().compareTo(availableLimit) > 0) {
            throw new BadRequestException("Insufficient credit facility limit. Available: " + availableLimit + " USD");
        }

        bg.setClient(client);
        bg.setCreditFacility(facility);
        bg.setIssueDate(LocalDate.now());
        bg.setStatus("DRAFT");

        if (bg.getBgNumber() == null || bg.getBgNumber().trim().isEmpty()) {
            bg.setBgNumber("BG-" + LocalDate.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000)));
        }

        BankGuarantee savedBG = bgRepository.save(bg);

        auditLogService.log(null, username, "BG_CREATION_DRAFT", 
                "Created BG Draft: " + savedBG.getBgNumber() + " for " + savedBG.getAmount() + " " + savedBG.getCurrency(), null);

        // Sanctions screening trigger
        sanctionsScreeningService.screenEntity(bg.getBeneficiaryName(), "BENEFICIARY", "BG", savedBG.getBgNumber());

        return savedBG;
    }

    @Transactional
    public BankGuarantee updateStatus(Long id, String status, String username) {
        BankGuarantee bg = getBGById(id);
        String oldStatus = bg.getStatus();

        // 🔒 COMPLIANCE HOLD: block if FLAGGED screening exists for this BG
        boolean hasComplianceHold = !sanctionsScreeningRepository
                .findByTransactionIdAndStatus(bg.getBgNumber(), "FLAGGED").isEmpty();
        if (hasComplianceHold) {
            auditLogService.log(null, username, "COMPLIANCE_HOLD_BLOCKED",
                    "Blocked status update on BG " + bg.getBgNumber() + " — open compliance hold (FLAGGED screening). Resolve via Compliance module first.", null);
            throw new IllegalStateException(
                    "COMPLIANCE_HOLD: Bank Guarantee '" + bg.getBgNumber() + "' has an unresolved sanctions screening flag. " +
                    "A Compliance Manager must clear or block this entity before status can be advanced.");
        }

        bg.setStatus(status);

        if ("ACTIVE".equals(status) && !"ACTIVE".equals(oldStatus)) {
            CreditFacility facility = bg.getCreditFacility();
            BigDecimal available = facility.getLimitAmount().subtract(facility.getUtilizedAmount());
            if (bg.getAmount().compareTo(available) > 0) {
                throw new BadRequestException("Cannot activate BG: Facility limit exceeded. Available: " + available);
            }
            facility.setUtilizedAmount(facility.getUtilizedAmount().add(bg.getAmount()));
            facilityRepository.save(facility);
        } else if ("RELEASED".equals(status) && "ACTIVE".equals(oldStatus)) {
            // Refund utilized limit
            CreditFacility facility = bg.getCreditFacility();
            BigDecimal refundAmount = bg.getAmount().min(facility.getUtilizedAmount());
            facility.setUtilizedAmount(facility.getUtilizedAmount().subtract(refundAmount));
            facilityRepository.save(facility);
        }

        BankGuarantee updated = bgRepository.save(bg);
        auditLogService.log(null, username, "BG_STATUS_UPDATE",
                "Updated BG status: " + bg.getBgNumber() + " from " + oldStatus + " to " + status, null);

        return updated;
    }

    @Transactional
    public BankGuarantee submitForApproval(Long id, String username) {
        BankGuarantee bg = getBGById(id);
        if (!"DRAFT".equals(bg.getStatus())) {
            throw new BadRequestException(
                "Only DRAFT guarantees can be submitted for approval. Current status: " + bg.getStatus());
        }
        bg.setStatus("PENDING_APPROVAL");
        BankGuarantee updated = bgRepository.save(bg);
        auditLogService.log(null, username, "BG_SUBMITTED_FOR_APPROVAL",
                "Client submitted BG for Operations review: " + bg.getBgNumber(), null);
        return updated;
    }

    @Transactional
    public BGClaim fileClaim(Long bgId, BigDecimal amount, String paymentDetails, String username) {
        BankGuarantee bg = getBGById(bgId);
        
        BGClaim claim = new BGClaim();
        claim.setBg(bg);
        claim.setClaimRef("CLM-" + bg.getBgNumber() + "-" + System.currentTimeMillis() % 10000);
        claim.setAmount(amount);
        claim.setClaimDate(LocalDate.now());
        claim.setStatus("PENDING");
        claim.setPaymentDetails(paymentDetails);

        return claimRepository.save(claim);
    }

    @Transactional
    public BGClaim processClaim(Long claimId, String status, String username) {
        BGClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("BG claim not found"));
        
        claim.setStatus(status);

        if ("APPROVED".equals(status)) {
            BankGuarantee bg = claim.getBg();
            bg.setStatus("CLAIMED");
            bgRepository.save(bg);

            // Relinquish utilized facility amount
            CreditFacility facility = bg.getCreditFacility();
            BigDecimal releaseAmount = bg.getAmount().min(facility.getUtilizedAmount());
            facility.setUtilizedAmount(facility.getUtilizedAmount().subtract(releaseAmount));
            facilityRepository.save(facility);

            auditLogService.log(null, username, "BG_CLAIM_APPROVED", 
                    "Approved BG Claim: " + claim.getClaimRef() + " of " + claim.getAmount() + " USD. Settled and closed BG.", null);
        }

        return claimRepository.save(claim);
    }

    public List<BGClaim> getClaims(Long bgId) {
        return claimRepository.findByBgId(bgId);
    }
}
