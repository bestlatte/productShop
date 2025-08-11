package org.example.productshop.controller;

import org.example.productshop.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping(value = "/search", produces = "application/json")
    public ResponseEntity<?> search(@RequestParam String keyword) {
        var list = productService.search(keyword);
        return ResponseEntity.ok(Map.of("results", list));
    }
}
