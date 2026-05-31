package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.entity.*;
import com.tradevault.service.LetterOfCreditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/lcs")
@CrossOrigin(origins = "*")
public class LetterOfCreditController {

    @Autowired
    private LetterOfCreditService lcService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LetterOfCredit>>> getAllLCs() {
        return ResponseEntity.ok(ApiResponse.success("Letters of Credit fetched successfully", lcService.getAllLCs()));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<List<LetterOfCredit>>> getLCsByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.success("Letters of Credit for client fetched", lcService.getLCsByClientId(clientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LetterOfCredit>> getLCById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Letter of Credit details", lcService.getLCById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LetterOfCredit>> createLC(
            @RequestBody LetterOfCredit lc,
            @RequestParam Long clientId,
            @RequestParam Long facilityId,
            Principal principal) {
        LetterOfCredit created = lcService.createLC(lc, clientId, facilityId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Letter of Credit draft created successfully", created));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CLIENT', 'OPERATIONS', 'RELATIONSHIP_MANAGER', 'COMPLIANCE', 'ADMIN')")
    public ResponseEntity<ApiResponse<LetterOfCredit>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        String status = payload.get("status");
        LetterOfCredit updated = lcService.updateStatus(id, status, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Letter of Credit status updated to: " + status, updated));
    }

    // Amendments APIs
    @GetMapping("/{id}/amendments")
    public ResponseEntity<ApiResponse<List<LCAmendment>>> getAmendments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("LC Amendments fetched", lcService.getAmendments(id)));
    }

    @PostMapping("/{id}/amendments")
    public ResponseEntity<ApiResponse<LCAmendment>> requestAmendment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            Principal principal) {
        BigDecimal newAmount = new BigDecimal(payload.get("newAmount").toString());
        LocalDate newExpiry = LocalDate.parse(payload.get("newExpiryDate").toString());
        String justification = payload.get("justification").toString();
        
        LCAmendment requested = lcService.requestAmendment(id, newAmount, newExpiry, justification, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("LC Amendment requested successfully", requested));
    }

    @PutMapping("/amendments/{amendmentId}")
    @PreAuthorize("hasAnyRole('OPERATIONS', 'RELATIONSHIP_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LCAmendment>> processAmendment(
            @PathVariable Long amendmentId,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        String status = payload.get("status");
        LCAmendment processed = lcService.processAmendment(amendmentId, status, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Amendment processed successfully", processed));
    }

    // Drawings APIs
    @GetMapping("/{id}/drawings")
    public ResponseEntity<ApiResponse<List<LCDrawing>>> getDrawings(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("LC Drawings fetched", lcService.getDrawings(id)));
    }

    @PostMapping("/{id}/drawings")
    public ResponseEntity<ApiResponse<LCDrawing>> presentDrawing(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            Principal principal) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String documents = payload.get("documentsPresented").toString();
        
        LCDrawing drawing = lcService.presentDrawing(id, amount, documents, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Documentary drawing presented successfully", drawing));
    }

    @PutMapping("/drawings/{drawingId}")
    @PreAuthorize("hasAnyRole('OPERATIONS', 'ADMIN')")
    public ResponseEntity<ApiResponse<LCDrawing>> processDrawing(
            @PathVariable Long drawingId,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        String status = payload.get("status");
        String discrepancy = payload.get("discrepancyNotes");
        
        LCDrawing processed = lcService.processDrawing(drawingId, status, discrepancy, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Drawing processed: " + status, processed));
    }
}
