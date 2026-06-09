package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.entity.Notification;
import com.tradevault.entity.User;
import com.tradevault.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private com.tradevault.repository.UserRepository userRepository;

    private void verifyUserAccess(Long userId, java.security.Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        if (!user.getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to access these notifications");
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@PathVariable Long userId, java.security.Principal principal) {
        verifyUserAccess(userId, principal);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", 
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications(@PathVariable Long userId, java.security.Principal principal) {
        verifyUserAccess(userId, principal);
        return ResponseEntity.ok(ApiResponse.success("Unread notifications fetched", 
                notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id, java.security.Principal principal) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        if (!notification.getUserId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to modify this notification");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }
}
