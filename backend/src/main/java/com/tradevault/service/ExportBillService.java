package com.tradevault.service;

import com.tradevault.entity.*;
import com.tradevault.exception.ResourceNotFoundException;
import com.tradevault.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExportBillService {

    @Autowired
    private ExportBillRepository billRepository;

    @Autowired
    private CollectionInstructionRepository instructionRepository;

    @Autowired
    private CorporateClientRepository clientRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private SanctionsScreeningService sanctionsScreeningService;

    @Autowired
    private SanctionsScreeningRepository sanctionsScreeningRepository;

    public List<ExportBill> getAllBills() {
        return billRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ExportBill> getBillsByClientId(Long clientId) {
        return billRepository.findByClientId(clientId);
    }

    public ExportBill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Export Bill not found"));
    }

    @Transactional
    public ExportBill createBill(ExportBill bill, Long clientId, String username) {
        CorporateClient client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        bill.setClient(client);
        bill.setStatus("INITIATED");
        bill.setTrackingStatus("DOCUMENTS_PREPARED");

        if (bill.getBillNumber() == null || bill.getBillNumber().trim().isEmpty()) {
            bill.setBillNumber("EXP-BILL-" + String.format("%04d", (int)(Math.random() * 9000 + 1000)));
        }

        ExportBill saved = billRepository.save(bill);
        auditLogService.log(null, username, "EXPORT_BILL_CREATED", 
                "Created export bill: " + saved.getBillNumber() + " for " + saved.getAmount(), null);

        sanctionsScreeningService.screenEntity(bill.getDraweeName(), "DRAWER", "EXPORT_BILL", saved.getBillNumber());

        return saved;
    }

    @Transactional
    public ExportBill updateBillStatus(Long id, String status, String trackingStatus, String username) {
        ExportBill bill = getBillById(id);

        // 🔒 COMPLIANCE HOLD: block status progression if a FLAGGED screening exists for this transaction
        boolean hasComplianceHold = !sanctionsScreeningRepository
                .findByTransactionIdAndStatus(bill.getBillNumber(), "FLAGGED").isEmpty();
        if (hasComplianceHold) {
            auditLogService.log(null, username, "COMPLIANCE_HOLD_BLOCKED",
                    "Blocked status update on bill " + bill.getBillNumber() + " — open compliance hold (FLAGGED screening). Resolve via Compliance module first.", null);
            throw new IllegalStateException(
                    "COMPLIANCE_HOLD: Export Bill '" + bill.getBillNumber() + "' has an unresolved sanctions screening flag. " +
                    "A Compliance Manager must clear or block this entity before status can be advanced.");
        }

        bill.setStatus(status);
        if (trackingStatus != null) {
            bill.setTrackingStatus(trackingStatus);
        }

        ExportBill saved = billRepository.save(bill);
        auditLogService.log(null, username, "EXPORT_BILL_STATUS_UPDATE",
                "Updated export bill " + bill.getBillNumber() + " status to: " + status, null);

        return saved;
    }

    // Collection instructions
    public List<CollectionInstruction> getAllInstructions() {
        return instructionRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<CollectionInstruction> getInstructionsByClientId(Long clientId) {
        return instructionRepository.findByClientId(clientId);
    }

    @Transactional
    public CollectionInstruction createInstruction(CollectionInstruction instruction, Long clientId, String username) {
        CorporateClient client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        instruction.setClient(client);
        instruction.setStatus("PENDING");

        if (instruction.getInstructionRef() == null || instruction.getInstructionRef().trim().isEmpty()) {
            instruction.setInstructionRef("COL-INST-" + String.format("%03d", (int)(Math.random() * 900 + 100)));
        }

        CollectionInstruction saved = instructionRepository.save(instruction);
        auditLogService.log(null, username, "COLLECTION_INSTRUCTION_CREATED", 
                "Created Collection Instruction: " + saved.getInstructionRef() + " for " + saved.getAmount(), null);

        sanctionsScreeningService.screenEntity(instruction.getDraweeName(), "DRAWEE", "COLLECTION", saved.getInstructionRef());

        return saved;
    }

    @Transactional
    public CollectionInstruction updateInstructionStatus(Long id, String status, String username) {
        CollectionInstruction instruction = instructionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Collection instruction not found"));

        // 🔒 COMPLIANCE HOLD: block status progression if a FLAGGED screening exists for this transaction
        boolean hasComplianceHold = !sanctionsScreeningRepository
                .findByTransactionIdAndStatus(instruction.getInstructionRef(), "FLAGGED").isEmpty();
        if (hasComplianceHold) {
            auditLogService.log(null, username, "COMPLIANCE_HOLD_BLOCKED",
                    "Blocked status update on collection " + instruction.getInstructionRef() + " — open compliance hold (FLAGGED screening). Resolve via Compliance module first.", null);
            throw new IllegalStateException(
                    "COMPLIANCE_HOLD: Collection Instruction '" + instruction.getInstructionRef() + "' has an unresolved sanctions screening flag. " +
                    "A Compliance Manager must clear or block this entity before status can be advanced.");
        }

        instruction.setStatus(status);

        CollectionInstruction saved = instructionRepository.save(instruction);
        auditLogService.log(null, username, "COLLECTION_INSTRUCTION_UPDATE",
                "Updated collection instruction " + instruction.getInstructionRef() + " status to: " + status, null);

        return saved;
    }
}
