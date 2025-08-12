package org.example.productshop.service;

import org.example.productshop.dao.ShoppingCartItemDao;
import org.example.productshop.entity.ShoppingCartItem;
import org.example.productshop.exception.ItemNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartService {
    @Autowired
    private ShoppingCartItemDao cartItemDao;


    @Autowired
    private ShoppingCartItemDao cartDao;


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
    public String removeFromCart(long cartItemId) {
        int rows = cartItemDao.deleteById(cartItemId);
        if (rows == 0) {
            throw new ItemNotFoundException("購物車中沒有此商品");
        }
        return "商品已從購物車刪除";
    }


    public void updateQuantity(long cartItemId, int quantity) {
        Integer stock = cartDao.getStockByCartItemId(cartItemId); // ✅ 用物件呼叫
        if (stock == null) {
            throw new RuntimeException("ITEM_NOT_FOUND");
        }
        if (quantity > stock) {
            throw new RuntimeException("OUT_OF_STOCK");
        }

        int rows = cartDao.updateCartItemQuantity(cartItemId, quantity);
        if (rows == 0) {
            throw new RuntimeException("ITEM_NOT_FOUND");
        }
    }

}
