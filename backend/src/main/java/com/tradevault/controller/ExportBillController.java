package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.entity.CollectionInstruction;
import com.tradevault.entity.ExportBill;
import com.tradevault.entity.User;
import com.tradevault.service.ExportBillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bills")
@CrossOrigin(origins = "*")
public class ExportBillController {

    @Autowired
    private ExportBillService billService;

    @Autowired
    private com.tradevault.repository.UserRepository userRepository;

    private void checkClientAccess(Long clientId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        if ("CLIENT".equals(user.getRole())) {
            if (user.getCorporateClient() == null || !user.getCorporateClient().getId().equals(clientId)) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to access this client's data");
            }
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExportBill>>> getAllBills(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        if ("CLIENT".equals(user.getRole())) {
            if (user.getCorporateClient() == null) {
                return ResponseEntity.ok(ApiResponse.success("Export Bills fetched successfully", java.util.Collections.emptyList()));
            }
            return ResponseEntity.ok(ApiResponse.success("Export Bills fetched successfully", 
                    billService.getBillsByClientId(user.getCorporateClient().getId())));
        }
        return ResponseEntity.ok(ApiResponse.success("Export Bills fetched successfully", billService.getAllBills()));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<ApiResponse<List<ExportBill>>> getBillsByClientId(@PathVariable Long clientId, Principal principal) {
        checkClientAccess(clientId, principal);
        return ResponseEntity.ok(ApiResponse.success("Export Bills fetched", billService.getBillsByClientId(clientId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExportBill>> createBill(
            @RequestBody ExportBill bill,
            @RequestParam Long clientId,
            Principal principal) {
        checkClientAccess(clientId, principal);
        ExportBill created = billService.createBill(bill, clientId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Export Bill initiated successfully", created));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OPERATIONS', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExportBill>> updateBillStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        String status = payload.get("status");
        String trackingStatus = payload.get("trackingStatus");
        ExportBill updated = billService.updateBillStatus(id, status, trackingStatus, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Export Bill status updated", updated));
    }

    // Collection instructions
    @GetMapping("/collections")
    public ResponseEntity<ApiResponse<List<CollectionInstruction>>> getAllCollections(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        if ("CLIENT".equals(user.getRole())) {
            if (user.getCorporateClient() == null) {
                return ResponseEntity.ok(ApiResponse.success("Collection Instructions fetched", java.util.Collections.emptyList()));
            }
            return ResponseEntity.ok(ApiResponse.success("Collection Instructions fetched", 
                    billService.getInstructionsByClientId(user.getCorporateClient().getId())));
        }
        return ResponseEntity.ok(ApiResponse.success("Collection Instructions fetched", billService.getAllInstructions()));
    }

    @GetMapping("/collections/client/{clientId}")
    public ResponseEntity<ApiResponse<List<CollectionInstruction>>> getCollectionsByClientId(@PathVariable Long clientId, Principal principal) {
        checkClientAccess(clientId, principal);
        return ResponseEntity.ok(ApiResponse.success("Collection Instructions fetched", billService.getInstructionsByClientId(clientId)));
    }

    @PostMapping("/collections")
    public ResponseEntity<ApiResponse<CollectionInstruction>> createCollection(
            @RequestBody CollectionInstruction instruction,
            @RequestParam Long clientId,
            Principal principal) {
        checkClientAccess(clientId, principal);
        CollectionInstruction created = billService.createInstruction(instruction, clientId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Collection Instruction registered", created));
    }

    @PutMapping("/collections/{id}")
    @PreAuthorize("hasAnyRole('OPERATIONS', 'ADMIN')")
    public ResponseEntity<ApiResponse<CollectionInstruction>> updateCollectionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        String status = payload.get("status");
        CollectionInstruction updated = billService.updateInstructionStatus(id, status, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Collection Instruction status updated", updated));
    }
}
