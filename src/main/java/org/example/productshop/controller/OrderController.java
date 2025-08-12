package org.example.productshop.controller;

import org.example.productshop.dao.OrderDao;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderDao orderDao;

    public OrderController(OrderDao orderDao) {
        this.orderDao = orderDao;
    }

    // 1) 購物車送單（由 Node 在 /ecpay/checkout 之前先呼叫建立，或你的前端先呼叫）
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        int amount = Integer.parseInt(String.valueOf(body.getOrDefault("amount", "0")));
        String name = String.valueOf(body.getOrDefault("itemName", "未命名商品"));
        Integer userId = body.get("userId") == null ? null : Integer.parseInt(body.get("userId").toString());
        if (amount <= 0) return ResponseEntity.badRequest().body(Map.of("error", "amount 不合法"));

        long orderId = orderDao.createOrder(userId, amount, name);
        return ResponseEntity.ok(Map.of("orderId", orderId));
    }

    // 2) 給 ecpay-complete.html 查狀態
    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@RequestParam long orderId) {
        try {
            Map<String, Object> m = orderDao.getStatus(orderId);
            return ResponseEntity.ok(Map.of(
                    "status", String.valueOf(m.getOrDefault("status", "PENDING")),
                    "paymentDate", String.valueOf(m.getOrDefault("payment_date", "")),
                    "tradeNo", String.valueOf(m.getOrDefault("trade_no", ""))));
        } catch (Exception e) {
            // 尚未寫入或找不到
            return ResponseEntity.status(404).body(Map.of("status", "PENDING"));
        }
    }

    // 3) （可選）給 Node 在 webhook 驗簽通過後回寫
    @PostMapping("/mark-paid")
    public ResponseEntity<?> markPaid(@RequestBody Map<String, Object> body) {
        long orderId = Long.parseLong(String.valueOf(body.get("orderId")));
        String tradeNo = String.valueOf(body.getOrDefault("tradeNo", ""));
        String method = String.valueOf(body.getOrDefault("paymentMethod", ""));
        String paymentDate = String.valueOf(body.getOrDefault("paymentDate", ""));
        int n = orderDao.markPaid(orderId, tradeNo, method, paymentDate);
        return ResponseEntity.ok(Map.of("updated", n));
    }

    @PostMapping("/mark-failed")
    public ResponseEntity<?> markFailed(@RequestBody Map<String, Object> body) {
        long orderId = Long.parseLong(String.valueOf(body.get("orderId")));
        String paymentDate = String.valueOf(body.getOrDefault("paymentDate", ""));
        int n = orderDao.markFailed(orderId, paymentDate);
        return ResponseEntity.ok(Map.of("updated", n));
    }
}
