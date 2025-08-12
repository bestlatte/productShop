package org.example.productshop.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Map;

@Repository
public class OrderDao {
    private final JdbcTemplate jdbc;

    public OrderDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // 建一筆訂單：先用 PENDING、金額與可選名稱（真的要拆 item 請之後擴成 order_items）
    public long createOrder(Integer userId, int amount, String name) {
        String sql = "INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, 'PENDING', NOW())";
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setObject(1, userId); // 允許 null -> 會變成 0 / 或你表格若不可 null 就塞 0
            ps.setInt(2, amount);
            return ps;
        }, kh);
        Number key = kh.getKey();
        return key == null ? 0L : key.longValue();
    }

    public Map<String, Object> getStatus(long orderId) {
        String sql = "SELECT status, payment_date, trade_no FROM orders WHERE id = ?";
        return jdbc.queryForMap(sql, orderId);
    }

    // 提供 Node（或測試）回寫已付款
    public int markPaid(long orderId, String tradeNo, String paymentMethod, String paymentDate) {
        String sql = "UPDATE orders SET status='PAID', trade_no=?, payment_method=?, payment_date=? WHERE id=?";
        return jdbc.update(sql, tradeNo, paymentMethod, paymentDate, orderId);
    }

    // 失敗/取消
    public int markFailed(long orderId, String paymentDate) {
        String sql = "UPDATE orders SET status='FAILED', payment_date=? WHERE id=?";
        return jdbc.update(sql, paymentDate, orderId);
    }
}
