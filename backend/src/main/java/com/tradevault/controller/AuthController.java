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
}
