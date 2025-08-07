package org.example.productshop.dao;


import org.example.productshop.entity.ShoppingCartItem;

public interface ShoppingCartItemDao {
    ShoppingCartItem findByUserIdAndProductId(Integer UserId, Long productId);
        void save(ShoppingCartItem item);

}
