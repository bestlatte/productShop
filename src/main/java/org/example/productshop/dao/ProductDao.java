package org.example.productshop.dao;

import org.example.productshop.entity.ProductSearchResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ProductDao {
@Autowired
    private NamedParameterJdbcTemplate jdbc;

    public List<ProductSearchResult> searchByKeyword(String keyword){
        String sql = """
            SELECT 
              id AS productId,
              name,
              price,
              stock_quantity AS stockQuantity
            FROM products
            WHERE name LIKE :kw
        """;
        return jdbc.query(sql,
                new MapSqlParameterSource("kw", "%" + keyword + "%"),
                new BeanPropertyRowMapper<>(ProductSearchResult.class));
    }
}
