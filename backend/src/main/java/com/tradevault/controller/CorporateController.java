package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.entity.CorporateClient;
import com.tradevault.entity.CreditFacility;
import com.tradevault.repository.CorporateClientRepository;
import com.tradevault.repository.CreditFacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/corporates")
@CrossOrigin(origins = "*")
public class CorporateController {

    @Autowired
    private CorporateClientRepository clientRepository;

    @Autowired
    private CreditFacilityRepository facilityRepository;

    @GetMapping("/clients")
    public ResponseEntity<ApiResponse<List<CorporateClient>>> getAllClients() {
        return ResponseEntity.ok(ApiResponse.success("Corporate clients fetched", clientRepository.findAll()));
    }

    @GetMapping("/clients/{id}")
    public ResponseEntity<ApiResponse<CorporateClient>> getClientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Corporate client details", clientRepository.findById(id).orElseThrow()));
    }

    @PostMapping("/clients")
    public ResponseEntity<ApiResponse<CorporateClient>> createClient(@RequestBody CorporateClient client) {
        return ResponseEntity.ok(ApiResponse.success("Corporate client created", clientRepository.save(client)));
    }

    // Facilities APIs
    @GetMapping("/facilities")
    public ResponseEntity<ApiResponse<List<CreditFacility>>> getAllFacilities() {
        return ResponseEntity.ok(ApiResponse.success("Credit facilities fetched", facilityRepository.findAll()));
    }

    @GetMapping("/facilities/client/{clientId}")
    public ResponseEntity<ApiResponse<List<CreditFacility>>> getFacilitiesByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(ApiResponse.success("Credit facilities fetched for client", 
                facilityRepository.findByClientId(clientId)));
    }

    @PostMapping("/facilities")
    public ResponseEntity<ApiResponse<CreditFacility>> createFacility(
            @RequestBody CreditFacility facility, 
            @RequestParam Long clientId) {
        CorporateClient client = clientRepository.findById(clientId).orElseThrow();
        facility.setClient(client);
        return ResponseEntity.ok(ApiResponse.success("Credit facility created", facilityRepository.save(facility)));
    }
}
