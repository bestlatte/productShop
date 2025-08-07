package org.example.productshop.service;

import jakarta.transaction.Transactional;
import org.example.productshop.dao.ProductDao;
import org.example.productshop.dao.ShoppingCartItemDao;
import org.example.productshop.entity.Product;
import org.example.productshop.entity.ShoppingCartItem;
import org.example.productshop.exception.OutOfStockException;
import org.example.productshop.exception.ProductNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartService {
    @Autowired
    private ShoppingCartItemDao shoppingCartItemDao;

    @Autowired
    private ProductDao productDao;

    @Transactional
    public String addToCart(Integer userId, Long productId, Integer quantity) {
        Product product = productDao.findById(productId);
        if (product == null) throw new ProductNotFoundException("商品不存在");
        if (product.getStockQuantity() < quantity) throw new OutOfStockException("商品庫存不足");

        ShoppingCartItem cartItem = shoppingCartItemDao.findByUserIdAndProductId(userId, productId);
        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            shoppingCartItemDao.save(cartItem);
        } else {
            ShoppingCartItem newItem = new ShoppingCartItem();
            newItem.setUserId(userId);
            newItem.setProductId(productId);
            newItem.setQuantity(quantity);
            shoppingCartItemDao.save(newItem);
        }
        return "商品已加入購物車";
    }
}
