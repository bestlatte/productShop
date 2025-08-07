package org.example.productshop.controller;

import org.example.productshop.entity.CartRequest;
import org.example.productshop.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*") // ← 加上這行允許跨來源請求
public class CartController {
    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartRequest request) {
        String msg = cartService.addToCart(request.getUserId(), request.getProductId(), request.getQuantity());
        Map<String, String> response = new HashMap<>();
        response.put("message", "已加入購物車: 產品 " + request.getProductId() + " x" + request.getQuantity());
        return ResponseEntity.ok(response);
    }
}
