package com.tradevault.service;

import com.tradevault.entity.AuditLog;
import com.tradevault.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void log(Long userId, String username, String action, String details, String ipAddress) {
        AuditLog log = new AuditLog(userId, username, action, details, ipAddress);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
