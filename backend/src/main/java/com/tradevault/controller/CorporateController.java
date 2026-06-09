package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.entity.CorporateClient;
import com.tradevault.entity.CreditFacility;
import com.tradevault.entity.User;
import com.tradevault.repository.CorporateClientRepository;
import com.tradevault.repository.CreditFacilityRepository;
import com.tradevault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/corporates")
@CrossOrigin(origins = "*")
public class CorporateController {

    @Autowired
    private CorporateClientRepository clientRepository;

    @Autowired
    private CreditFacilityRepository facilityRepository;

    @Autowired
    private UserRepository userRepository;

    // ─── Auth helpers ─────────────────────────────────────────────────────────

    private User resolveUser(Principal principal) {
        return userRepository.findByUsername(principal.getName()).orElseThrow();
    }

    private void requireAdmin(Principal principal) {
        User u = resolveUser(principal);
        if (!"ADMIN".equals(u.getRole())) {
            throw new org.springframework.security.access.AccessDeniedException("Only administrators can perform this action");
        }
    }

    private void checkClientAccess(Long clientId, Principal principal) {
        User user = resolveUser(principal);
        if ("CLIENT".equals(user.getRole())) {
            if (user.getCorporateClient() == null || !user.getCorporateClient().getId().equals(clientId)) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to access this client's data");
            }
        }
    }

    // ─── Corporate Client CRUD ────────────────────────────────────────────────

    /** GET /corporates — list all clients (admin) or own client (client role) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CorporateClient>>> getAllClients(Principal principal) {
        User user = resolveUser(principal);
        if ("CLIENT".equals(user.getRole())) {
            if (user.getCorporateClient() == null) {
                return ResponseEntity.ok(ApiResponse.success("Corporate clients fetched", Collections.emptyList()));
            }
            return ResponseEntity.ok(ApiResponse.success("Corporate clients fetched", List.of(user.getCorporateClient())));
        }
        return ResponseEntity.ok(ApiResponse.success("Corporate clients fetched", clientRepository.findAll()));
    }

    /** GET /corporates/clients — legacy alias */
    @GetMapping("/clients")
    public ResponseEntity<ApiResponse<List<CorporateClient>>> getAllClientsLegacy(Principal principal) {
        return getAllClients(principal);
    }

    /** GET /corporates/{id} — single client detail (admin or own) */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CorporateClient>> getClientById(
            @PathVariable Long id, Principal principal) {
        checkClientAccess(id, principal);
        return ResponseEntity.ok(ApiResponse.success("Corporate client details",
                clientRepository.findById(id).orElseThrow()));
    }

    /** POST /corporates — create corporate client (ADMIN only) */
    @PostMapping
    public ResponseEntity<ApiResponse<CorporateClient>> createClient(
            @RequestBody CorporateClient client, Principal principal) {
        requireAdmin(principal);
        return ResponseEntity.ok(ApiResponse.success("Corporate client created", clientRepository.save(client)));
    }

    /** POST /corporates/clients — legacy alias for create */
    @PostMapping("/clients")
    public ResponseEntity<ApiResponse<CorporateClient>> createClientLegacy(
            @RequestBody CorporateClient client, Principal principal) {
        return createClient(client, principal);
    }

    /** PUT /corporates/{id} — update corporate client fields (ADMIN only) */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CorporateClient>> updateClient(
            @PathVariable Long id, @RequestBody CorporateClient patch, Principal principal) {
        requireAdmin(principal);
        CorporateClient existing = clientRepository.findById(id).orElseThrow();
        if (patch.getCompanyName() != null) existing.setCompanyName(patch.getCompanyName());
        if (patch.getCountry() != null)      existing.setCountry(patch.getCountry());
        if (patch.getTaxId() != null)        existing.setTaxId(patch.getTaxId());
        if (patch.getCreditLimit() != null)  existing.setCreditLimit(patch.getCreditLimit());
        if (patch.getStatus() != null)       existing.setStatus(patch.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Corporate client updated", clientRepository.save(existing)));
    }

    // ─── Credit Facility CRUD ─────────────────────────────────────────────────

    /** GET /corporates/facilities — list facilities (admin: all; client: own) */
    @GetMapping("/facilities")
    public ResponseEntity<ApiResponse<List<CreditFacility>>> getAllFacilities(Principal principal) {
        User user = resolveUser(principal);
        if ("CLIENT".equals(user.getRole())) {
            if (user.getCorporateClient() == null) {
                return ResponseEntity.ok(ApiResponse.success("Credit facilities fetched", Collections.emptyList()));
            }
            return ResponseEntity.ok(ApiResponse.success("Credit facilities fetched",
                    facilityRepository.findByClientId(user.getCorporateClient().getId())));
        }
        return ResponseEntity.ok(ApiResponse.success("Credit facilities fetched", facilityRepository.findAll()));
    }

    /** GET /corporates/{clientId}/facilities — list facilities for one client */
    @GetMapping("/{clientId}/facilities")
    public ResponseEntity<ApiResponse<List<CreditFacility>>> getFacilitiesByClient(
            @PathVariable Long clientId, Principal principal) {
        checkClientAccess(clientId, principal);
        return ResponseEntity.ok(ApiResponse.success("Credit facilities fetched for client",
                facilityRepository.findByClientId(clientId)));
    }

    /** GET /corporates/facilities/client/{clientId} — legacy alias */
    @GetMapping("/facilities/client/{clientId}")
    public ResponseEntity<ApiResponse<List<CreditFacility>>> getFacilitiesByClientLegacy(
            @PathVariable Long clientId, Principal principal) {
        return getFacilitiesByClient(clientId, principal);
    }

    /** POST /corporates/facilities?clientId= — create facility (ADMIN only) */
    @PostMapping("/facilities")
    public ResponseEntity<ApiResponse<CreditFacility>> createFacility(
            @RequestBody CreditFacility facility,
            @RequestParam Long clientId,
            Principal principal) {
        requireAdmin(principal);
        CorporateClient client = clientRepository.findById(clientId).orElseThrow();
        facility.setClient(client);
        if (facility.getUtilizedAmount() == null) facility.setUtilizedAmount(BigDecimal.ZERO);
        return ResponseEntity.ok(ApiResponse.success("Credit facility created", facilityRepository.save(facility)));
    }

    /** PUT /corporates/facilities/{id} — update facility fields (ADMIN only) */
    @PutMapping("/facilities/{id}")
    public ResponseEntity<ApiResponse<CreditFacility>> updateFacility(
            @PathVariable Long id, @RequestBody CreditFacility patch, Principal principal) {
        requireAdmin(principal);
        CreditFacility existing = facilityRepository.findById(id).orElseThrow();
        if (patch.getFacilityType() != null) existing.setFacilityType(patch.getFacilityType());
        if (patch.getLimitAmount() != null)  existing.setLimitAmount(patch.getLimitAmount());
        if (patch.getCurrency() != null)     existing.setCurrency(patch.getCurrency());
        if (patch.getExpiryDate() != null)   existing.setExpiryDate(patch.getExpiryDate());
        if (patch.getStatus() != null)       existing.setStatus(patch.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Credit facility updated", facilityRepository.save(existing)));
    }
}
