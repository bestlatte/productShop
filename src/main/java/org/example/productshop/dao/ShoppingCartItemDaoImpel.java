package org.example.productshop.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.example.productshop.entity.ShoppingCartItem;

@Repository
public class ShoppingCartItemDaoImpel implements ShoppingCartItemDao {
    @PersistenceContext
    private EntityManager em;

    @Override
    public ShoppingCartItem findByUserIdAndProductId(Integer userId, Long productId) {
        try {
            return em.createQuery("FROM ShoppingCartItem WHERE userId = :userId AND productId = :productId", ShoppingCartItem.class)
                    .setParameter("userId", userId)
                    .setParameter("productId", productId)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    @Override
    public void save(ShoppingCartItem item) {
        if (item.getId() == null) {
            em.persist(item);
        } else {
            em.merge(item);
        }
    }
}

