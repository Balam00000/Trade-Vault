package com.tradevault.controller;

import com.tradevault.dto.ApiResponse;
import com.tradevault.service.TradeAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*")
public class TradeAnalyticsController {

    @Autowired
    private TradeAnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalyticsSummary() {
        return ResponseEntity.ok(ApiResponse.success("Analytics summary retrieved", analyticsService.getAnalyticsSummary()));
    }
}
