package org.example.productshop.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public class ProductPriceDao {

    @Autowired
    private NamedParameterJdbcTemplate jdbc;

    public Integer findIdByName(String name) {
        String sql = "SELECT id FROM products WHERE name = :name LIMIT 1";
        return jdbc.query(sql, new MapSqlParameterSource("name", name),
                rs -> rs.next() ? rs.getInt("id") : null);
    }

    public int updatePriceByName(String name, BigDecimal price) {
        String sql = "UPDATE products SET price = :price WHERE name = :name";
        return jdbc.update(sql, new MapSqlParameterSource()
                .addValue("price", price)
                .addValue("name", name));
    }

    public int insertProduct(String name, BigDecimal price) {
        String sql = """
            INSERT INTO products (name, price, stock_quantity)
            VALUES (:name, :price, :stock)
            """;
        return jdbc.update(sql, new MapSqlParameterSource()
                .addValue("name", name)
                .addValue("price", price)
                .addValue("stock", 0));
    }
}
