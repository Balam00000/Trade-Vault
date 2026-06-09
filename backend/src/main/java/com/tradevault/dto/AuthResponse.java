package com.tradevault.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private String role;
    private String email;
    private String status;
    private Long id;
    private Long corporateClientId;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String fullName, String role, String email, String status) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.email = email;
        this.status = status;
    }

    public AuthResponse(String token, String username, String fullName, String role, String email, String status, Long id, Long corporateClientId) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.email = email;
        this.status = status;
        this.id = id;
        this.corporateClientId = corporateClientId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCorporateClientId() { return corporateClientId; }
    public void setCorporateClientId(Long corporateClientId) { this.corporateClientId = corporateClientId; }
}
