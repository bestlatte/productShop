package org.example.productshop.dao;

import org.example.productshop.entity.CartItemView;
import org.example.productshop.entity.ShoppingCartItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

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

    // 刪除購物車商品
    public int deleteCartItem(long userId, long cartItemId) {
        String sql = """
        DELETE FROM shopping_cart_items
        WHERE id = :id AND user_id = :userId
    """;
        return jdbcTemplate.update(sql, new MapSqlParameterSource()
                .addValue("id", cartItemId)   // long OK
                .addValue("userId", userId)); // long OK
    }



    // 新增(減少)購物車商品
    public int updateCartItemQuantity(long cartItemId, int quantity) {
        String sql = "UPDATE shopping_cart_items SET quantity = :quantity WHERE id = :id";
        return jdbcTemplate.update(sql, new MapSqlParameterSource()
                .addValue("quantity", quantity)
                .addValue("id", cartItemId));
    }

    public int getStockByCartItemId(long cartItemId) {
        String sql = """
        SELECT p.stock_quantity
        FROM shopping_cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.id = :id
    """;
        return jdbcTemplate.query(sql, new MapSqlParameterSource("id", cartItemId),
                rs -> rs.next() ? rs.getInt("stock_quantity") : 0);
    }

    // 顯示購物車已加入商品
    public List<CartItemView> listCartItemsByUserId(long userId) {
        String sql = """
        SELECT 
            c.id           AS cart_item_id,
            c.product_id   AS product_id,
            p.name         AS name,
            p.price        AS price,
            c.quantity     AS quantity,
            (p.price * c.quantity) AS subtotal
        FROM shopping_cart_items c
        JOIN products p ON p.id = c.product_id
        WHERE c.user_id = :userId
        ORDER BY c.id
    """;

        RowMapper<CartItemView> mapper = (rs, i) -> {
            CartItemView v = new CartItemView();
            v.setCartItemId(rs.getLong("cart_item_id"));
            v.setProductId(rs.getLong("product_id"));
            v.setName(rs.getString("name"));
            v.setPrice(rs.getBigDecimal("price"));
            v.setQuantity(rs.getInt("quantity"));
            v.setSubtotal(rs.getBigDecimal("subtotal"));
            return v;
        };

        return jdbcTemplate.query(sql, new MapSqlParameterSource("userId", userId), mapper);
    }

}
