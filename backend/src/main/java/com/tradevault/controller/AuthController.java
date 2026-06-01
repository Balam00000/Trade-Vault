package com.tradevault.controller;

import com.tradevault.config.JwtTokenProvider;
import com.tradevault.dto.*;
import com.tradevault.entity.User;
import com.tradevault.repository.UserRepository;
import com.tradevault.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        
        AuthResponse authResponse = new AuthResponse(
                jwt,
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                user.getEmail(),
                user.getStatus()
        );

        auditLogService.log(user.getId(), user.getUsername(), "USER_LOGIN", 
                "User successfully logged in via REST API context", null);

        return ResponseEntity.ok(ApiResponse.success("Authentication successful", authResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Username is already taken!"));
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email Address already in use!"));
        }

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getEmail(),
                registerRequest.getFullName(),
                registerRequest.getRole()
        );

        userRepository.save(user);
        auditLogService.log(null, registerRequest.getUsername(), "USER_REGISTER", 
                "Registered new user account with role: " + registerRequest.getRole(), null);

        return ResponseEntity.ok(ApiResponse.success("User registered successfully"));
    }
    // ── Profile Endpoints (accessible by ALL authenticated roles) ──────────────

    /**
     * GET /auth/me — returns the currently authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AuthResponse profile = new AuthResponse(
                null,
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                user.getEmail(),
                user.getStatus()
        );
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", profile));
    }

    /**
     * PUT /auth/profile — updates the authenticated user's username, email, and/or password.
     * All fields are optional — only supply what you want to change.
     * Password change requires the current password for verification.
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest req) {

        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ── Username change ────────────────────────────────────────────────
        if (req.getNewUsername() != null && !req.getNewUsername().isBlank()) {
            String newUname = req.getNewUsername().trim();
            if (!newUname.equals(user.getUsername())) {
                if (userRepository.existsByUsername(newUname)) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Username '" + newUname + "' is already taken."));
                }
                user.setUsername(newUname);
            }
        }

        // ── Email change ───────────────────────────────────────────────────
        if (req.getNewEmail() != null && !req.getNewEmail().isBlank()) {
            String newEmail = req.getNewEmail().trim();
            if (!newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Email '" + newEmail + "' is already in use."));
                }
                user.setEmail(newEmail);
            }
        }

        // ── Password change ────────────────────────────────────────────────
        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Current password is required to set a new password."));
            }
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Current password is incorrect."));
            }
            if (req.getNewPassword().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("New password must be at least 6 characters."));
            }
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        userRepository.save(user);
        auditLogService.log(user.getId(), user.getUsername(), "PROFILE_UPDATE",
                "User updated their profile credentials", null);

        String jwt = tokenProvider.generateToken(user.getUsername(), user.getRole());
        AuthResponse updated = new AuthResponse(
                jwt,
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                user.getEmail(),
                user.getStatus()
        );
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
