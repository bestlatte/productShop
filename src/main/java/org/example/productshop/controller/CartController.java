package org.example.productshop.controller;

import org.example.productshop.entity.CartRemoveRequest;
import org.example.productshop.entity.CartRequest;
import org.example.productshop.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartRequest request) {
        try {
            String msg = cartService.addToCart(request.getUserId(), request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(Map.of("message", msg));
        } catch (Exception e) {
            e.printStackTrace(); // ★ 看 console 紅字，定位哪一行炸
            return ResponseEntity.status(500).body(Map.of("error","RUNTIME_ERROR","message","執行期間發生錯誤"));
        }
    }


    @DeleteMapping("/remove")
    public ResponseEntity<?> remove(@RequestParam long cartItemId) {
        String msg = cartService.removeFromCart(cartItemId);
        return ResponseEntity.ok(Map.of("message", msg));
    }
}
