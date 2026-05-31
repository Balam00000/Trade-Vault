package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.entity.ComplianceCase;
import com.tradevault.entity.SanctionsScreening;
import com.tradevault.service.SanctionsScreeningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/compliance")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
public class ComplianceController {

    @Autowired
    private SanctionsScreeningService sanctionsScreeningService;

    @GetMapping("/screenings")
    public ResponseEntity<ApiResponse<List<SanctionsScreening>>> getAllScreenings() {
        return ResponseEntity.ok(ApiResponse.success("Sanctions Screenings retrieved", sanctionsScreeningService.getAllScreenings()));
    }

    @GetMapping("/cases")
    public ResponseEntity<ApiResponse<List<ComplianceCase>>> getAllCases() {
        return ResponseEntity.ok(ApiResponse.success("Compliance Cases retrieved", sanctionsScreeningService.getAllCases()));
    }

    @PutMapping("/cases/{caseId}/resolve")
    public ResponseEntity<ApiResponse<ComplianceCase>> resolveCase(
            @PathVariable Long caseId,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        String status = payload.get("status");
        String notes = payload.get("notes");
        
        ComplianceCase resolved = sanctionsScreeningService.resolveCase(caseId, status, notes, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Compliance case resolved: " + status, resolved));
    }
}
