package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.entity.BGClaim;
import com.tradevault.entity.BankGuarantee;
import com.tradevault.entity.User;
import com.tradevault.service.BankGuaranteeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bgs")
@CrossOrigin(origins = "*")
public class BankGuaranteeController {

    @Autowired
    private BankGuaranteeService bgService;

    @Autowired
    private com.tradevault.repository.UserRepository userRepository;

    private void checkBgAccess(BankGuarantee bg, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        if ("CLIENT".equals(user.getRole())) {
            if (user.getCorporateClient() == null || !bg.getClient().getId().equals(user.getCorporateClient().getId())) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to access this Bank Guarantee");
            }
        }
    }

    private void checkClientAccess(Long clientId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        if ("CLIENT".equals(user.getRole())) {
            if (user.getCorporateClient() == null || !user.getCorporateClient().getId().equals(clientId)) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to access this client's data");
            }
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BankGuarantee>>> getAllBGs(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        if ("CLIENT".equals(user.getRole())) {
            if (user.getCorporateClient() == null) {
                return ResponseEntity.ok(ApiResponse.success("Bank Guarantees fetched successfully", java.util.Collections.emptyList()));
            }
            return ResponseEntity.ok(ApiResponse.success("Bank Guarantees fetched successfully", 
                    bgService.getBGsByClientId(user.getCorporateClient().getId())));
        }
        return ResponseEntity.ok(ApiResponse.success("Bank Guarantees fetched successfully", bgService.getAllBGs()));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<List<BankGuarantee>>> getBGsByClientId(@PathVariable Long clientId, Principal principal) {
        checkClientAccess(clientId, principal);
        return ResponseEntity.ok(ApiResponse.success("Bank Guarantees for client fetched", bgService.getBGsByClientId(clientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BankGuarantee>> getBGById(@PathVariable Long id, Principal principal) {
        BankGuarantee bg = bgService.getBGById(id);
        checkBgAccess(bg, principal);
        return ResponseEntity.ok(ApiResponse.success("Bank Guarantee details", bg));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BankGuarantee>> createBG(
            @RequestBody BankGuarantee bg,
            @RequestParam Long clientId,
            @RequestParam Long facilityId,
            Principal principal) {
        checkClientAccess(clientId, principal);
        BankGuarantee created = bgService.createBG(bg, clientId, facilityId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Bank Guarantee draft created successfully", created));
    }

    // CLIENT submits their DRAFT BG for Operations review → PENDING_APPROVAL
    @PutMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<BankGuarantee>> submitForApproval(
            @PathVariable Long id,
            Principal principal) {
        BankGuarantee bg = bgService.getBGById(id);
        checkBgAccess(bg, principal);
        BankGuarantee submitted = bgService.submitForApproval(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Bank Guarantee submitted for Operations approval", submitted));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OPERATIONS', 'RELATIONSHIP_MANAGER', 'TREASURY', 'ADMIN')")
    public ResponseEntity<ApiResponse<BankGuarantee>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        String status = payload.get("status");
        BankGuarantee updated = bgService.updateStatus(id, status, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Bank Guarantee status updated to: " + status, updated));
    }

    // Claims APIs
    @GetMapping("/{id}/claims")
    public ResponseEntity<ApiResponse<List<BGClaim>>> getClaims(@PathVariable Long id, Principal principal) {
        BankGuarantee bg = bgService.getBGById(id);
        checkBgAccess(bg, principal);
        return ResponseEntity.ok(ApiResponse.success("BG Claims fetched", bgService.getClaims(id)));
    }

    @PostMapping("/{id}/claims")
    public ResponseEntity<ApiResponse<BGClaim>> fileClaim(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            Principal principal) {
        BankGuarantee bg = bgService.getBGById(id);
        checkBgAccess(bg, principal);
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String details = payload.get("paymentDetails").toString();
        
        BGClaim claim = bgService.fileClaim(id, amount, details, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Bank Guarantee Claim filed successfully", claim));
    }

    @PutMapping("/claims/{claimId}")
    @PreAuthorize("hasAnyRole('OPERATIONS', 'TREASURY', 'ADMIN')")
    public ResponseEntity<ApiResponse<BGClaim>> processClaim(
            @PathVariable Long claimId,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        String status = payload.get("status");
        BGClaim processed = bgService.processClaim(claimId, status, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("BG Claim processed successfully", processed));
    }
}
