package org.example.productshop.service;

import org.example.productshop.dao.ProductPriceDao;
import org.example.productshop.entity.OpenDataItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class OpenDataPriceSyncService {

    private static final String SOURCE_URL =
            "https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx";

    @Autowired private RestTemplate restTemplate;
    @Autowired private ProductPriceDao productPriceDao;

    // application.properties: app.crop-codes=A71,51,811,...
    @Value("${app.crop-codes:}")
    private String cropCodesSetting;

    public int sync() {
        // 1) 解析白名單（精準比對，大小寫敏感；想不敏感就兩邊都 toUpperCase）
        final Set<String> whitelist = Arrays.stream(cropCodesSetting.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        System.out.println("[OpenData][cfg] whitelist=" + whitelist);

        // 2) 取資料
        ResponseEntity<OpenDataItem[]> resp =
                restTemplate.exchange(SOURCE_URL, HttpMethod.GET, null, OpenDataItem[].class);
        OpenDataItem[] arr = resp.getBody();
        int raw = (arr == null ? 0 : arr.length);
        System.out.println("[OpenData] raw size=" + raw);
        if (raw == 0) return 0;


        // 在抓到 arr 之後、建立 stream 之前加：

// 1) API 內所有代號（去重）
        Set<String> codesInApi = Arrays.stream(arr)
                .filter(Objects::nonNull)
                .map(i -> i.getCropCode() == null ? "" : i.getCropCode().trim())
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

// 2) 有名稱且能計算出價格的代號（最終才可能寫入）
        Set<String> codesWithPrice = Arrays.stream(arr)
                .filter(Objects::nonNull)
                .filter(i -> i.getCropCode() != null)
                .filter(i -> i.getCropName() != null && !i.getCropName().trim().isEmpty())
                .filter(i -> i.resolvePrice() != null)
                .map(i -> i.getCropCode().trim())
                .collect(Collectors.toSet());

// 3) 計算差集
        Set<String> missingInApi = new LinkedHashSet<>(whitelist);
        missingInApi.removeAll(codesInApi);           // 白名單有，但 API 根本沒有

        Set<String> noPrice = new LinkedHashSet<>(whitelist);
        noPrice.retainAll(codesInApi);                // 先只看 API 有的
        noPrice.removeAll(codesWithPrice);            // 但最後沒被寫入（通常是沒有任何價格）

        System.out.println("[Diag] whitelist=" + whitelist);
        System.out.println("[Diag] presentInApi=" + (new LinkedHashSet<>(whitelist){{
            retainAll(codesInApi);
        }}));
        System.out.println("[Diag] missingInApi=" + missingInApi);
        System.out.println("[Diag] presentButNoPrice=" + noPrice);



        // 3) 基本過濾：要有「代號」且能算出價格；且「名稱」要有（因為要寫進 name）
        Stream<OpenDataItem> stream = Arrays.stream(arr)
                .filter(Objects::nonNull)
                .filter(i -> i.getCropCode() != null)
                .filter(i -> i.getCropName() != null && !i.getCropName().trim().isEmpty())
                .filter(i -> i.resolvePrice() != null);

        // 4) 白名單（空=不過濾；非空=代號精準比對）
        if (!whitelist.isEmpty()) {
            stream = stream.filter(i -> whitelist.contains(i.getCropCode().trim()));
        }

        // 5) 聚合：同一「作物名稱」若出現多筆，取最後一筆（或改成平均都行）
        List<OpenDataItem> list = stream
                .collect(Collectors.toMap(
                        i -> i.getCropName().trim(), // key: 作物名稱
                        i -> i,                       // val: 該筆
                        (a, b) -> b,                 // 名稱重複時取後者
                        LinkedHashMap::new
                ))
                .values()
                .stream()
                .toList();

        System.out.println("[OpenData] after filter size=" + list.size());
        list.stream().limit(8).forEach(i ->
                System.out.println("[OpenData] write -> code=" + i.getCropCode().trim()
                        + " name=" + i.getCropName().trim()
                        + " price=" + i.resolvePrice()));

        // 6) Upsert：以「作物名稱」作為唯一鍵
        int affected = 0;
        for (OpenDataItem item : list) {
            String productName = item.getCropName().trim(); // ← 寫入 products.name
            BigDecimal price = item.resolvePrice();

            Integer id = productPriceDao.findIdByName(productName);
            affected += (id == null)
                    ? productPriceDao.insertProduct(productName, price)
                    : productPriceDao.updatePriceByName(productName, price);
        }
        System.out.println("[OpenData] upsert updated=" + affected);
        return affected;
    }
}
