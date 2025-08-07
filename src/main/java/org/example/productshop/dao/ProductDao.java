package org.example.productshop.dao;

import org.example.productshop.entity.Product;

public interface ProductDao {
    Product findById(Long id);
}
