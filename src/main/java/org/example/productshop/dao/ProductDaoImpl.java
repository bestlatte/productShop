package org.example.productshop.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.productshop.entity.Product;
import org.springframework.stereotype.Repository;

@Repository
public class ProductDaoImpl implements ProductDao {
    @PersistenceContext
    private EntityManager em;

    @Override
    public Product findById(Long id) {
        return em.find(Product.class, id);
    }
}

