package org.example.productshop.entity;

import java.math.BigDecimal;
import java.util.List;

public class CartSummary {
    private List<CartItemView> items;
    private BigDecimal totalPrice;

    public CartSummary(List<CartItemView> items, BigDecimal totalPrice) {
        this.items = items;
        this.totalPrice = totalPrice;
    }

    public List<CartItemView> getItems() { return items; }
    public BigDecimal getTotalPrice() { return totalPrice; }
}
