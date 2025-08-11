package org.example.productshop.service;

import org.example.productshop.dao.ProductDao;
import org.example.productshop.entity.ProductSearchResult;
import org.example.productshop.exception.NoResultsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
@Autowired
    private ProductDao productDao;

    public List<ProductSearchResult> search(String keyword){
        if (keyword == null || keyword.trim().isEmpty())
            throw new IllegalArgumentException("keyword 不得為空");
        List<ProductSearchResult> list = productDao.searchByKeyword(keyword.trim());
        if (list.isEmpty())
            throw new NoResultsException("找不到相關商品");
        return list;
    }
}
