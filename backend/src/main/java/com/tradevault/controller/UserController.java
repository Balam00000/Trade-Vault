package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.dto.UserUpdateRequest;
import com.tradevault.entity.CorporateClient;
import com.tradevault.entity.User;
import com.tradevault.repository.CorporateClientRepository;
import com.tradevault.repository.UserRepository;
import com.tradevault.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CorporateClientRepository corporateClientRepository;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", userRepository.findAll()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request,
            Principal principal) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.tradevault.exception.ResourceNotFoundException("User not found with id: " + id));

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        if (request.getCorporateClientId() != null) {
            CorporateClient client = corporateClientRepository.findById(request.getCorporateClientId())
                    .orElseThrow(() -> new com.tradevault.exception.ResourceNotFoundException("Corporate Client not found"));
            user.setCorporateClient(client);
        } else {
            user.setCorporateClient(null);
        }

        User updated = userRepository.save(user);

        auditLogService.log(null, principal.getName(), "USER_UPDATE", 
                "Updated user account details for username: " + updated.getUsername() + ", Role: " + updated.getRole() + ", Status: " + updated.getStatus(), null);

        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id, Principal principal) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.tradevault.exception.ResourceNotFoundException("User not found with id: " + id));
        
        userRepository.delete(user);

        auditLogService.log(null, principal.getName(), "USER_DELETE", 
                "Deleted user account: " + user.getUsername(), null);

        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }
}
