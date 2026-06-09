package com.tradevault.dto;

public class UserUpdateRequest {
    private String fullName;
    private String email;
    private String role;
    private String status;
    private Long corporateClientId;

    public UserUpdateRequest() {}

    public UserUpdateRequest(String fullName, String email, String role, String status, Long corporateClientId) {
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.corporateClientId = corporateClientId;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getCorporateClientId() { return corporateClientId; }
    public void setCorporateClientId(Long corporateClientId) { this.corporateClientId = corporateClientId; }
}
