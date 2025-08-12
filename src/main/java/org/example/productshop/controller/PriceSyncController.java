package org.example.productshop.controller;

import org.example.productshop.service.OpenDataPriceSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class PriceSyncController {
    @Autowired
    private OpenDataPriceSyncService service;

    // 手動觸發：GET /api/products/{proudctId}/prices
    @GetMapping("/{productId}/prices")
    public ResponseEntity<?> refresh() {
        int n = service.sync();
        return ResponseEntity.ok(Map.of("message", "同步完成", "updated", n));
    }
}
