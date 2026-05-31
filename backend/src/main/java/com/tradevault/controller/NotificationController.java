package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.entity.Notification;
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", 
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Unread notifications fetched", 
                notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }
}
