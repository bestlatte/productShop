package org.example.productshop.service;

import org.example.productshop.dao.ShoppingCartItemDao;
import org.example.productshop.entity.ShoppingCartItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    @Autowired
    private ShoppingCartItemDao cartItemDao;

    public String addToCart(Integer userId, Integer productId, Integer quantity) {
        ShoppingCartItem item = cartItemDao.findByUserIdAndProductId(userId, productId);
        if (item == null) {
            cartItemDao.insertCartItem(userId, productId, quantity);
            return "已加入購物車: 產品 " + productId + " x" + quantity;
        } else {
            int newQuantity = item.getQuantity() + quantity;
            cartItemDao.updateCartItem(userId, productId, newQuantity);
            return "購物車已更新數量: 產品 " + productId + " x" + newQuantity;
        }
    }
}
