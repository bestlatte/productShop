package org.example.productshop.dao;

import org.example.productshop.entity.ShoppingCartItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ShoppingCartItemDao {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    // 檢查有沒有該筆購物車紀錄
    public ShoppingCartItem findByUserIdAndProductId(Integer userId, Integer productId) {
        String sql = "SELECT * FROM shopping_cart_items WHERE user_id = :userId AND product_id = :productId";
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("userId", userId);
        params.addValue("productId", productId);

        return jdbcTemplate.query(sql, params, new BeanPropertyRowMapper<>(ShoppingCartItem.class))
                .stream().findFirst().orElse(null);
    }

    // 新增購物車
    public void insertCartItem(Integer userId, Integer productId, Integer quantity) {
        String sql = "INSERT INTO shopping_cart_items(user_id, product_id, quantity) VALUES(:userId, :productId, :quantity)";
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("userId", userId);
        params.addValue("productId", productId);
        params.addValue("quantity", quantity);
        jdbcTemplate.update(sql, params);
    }

    // 更新購物車數量
    public void updateCartItem(Integer userId, Integer productId, Integer quantity) {
        String sql = "UPDATE shopping_cart_items SET quantity = :quantity WHERE user_id = :userId AND product_id = :productId";
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("quantity", quantity);
        params.addValue("userId", userId);
        params.addValue("productId", productId);
        jdbcTemplate.update(sql, params);
    }

    public int deleteById(long cartItemId) {
        String sql = "DELETE FROM shopping_cart_items WHERE id = :id";
        return jdbcTemplate.update(sql, new MapSqlParameterSource("id", cartItemId));
    }
}
