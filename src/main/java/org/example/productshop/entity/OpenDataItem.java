package org.example.productshop.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

/**
 * OpenData 映射：作物代號 / 名稱 / 平均價 / 上價 / 中價 / 下價
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenDataItem {

    @JsonAlias({"作物代號", "CropCode", "crop_code", "cropCode", "CROP_CODE"})
    private String cropCode;

    @JsonAlias({"作物名稱", "CropName", "crop_name", "cropName", "CROP_NAME"})
    private String cropName;

    @JsonAlias({"平均價", "Avg_Price", "avg_price", "avgPrice"})
    private BigDecimal avgPrice;

    // 上價 / 中價 / 下價
    @JsonAlias({"上價", "High_Price", "high_price", "highPrice"})
    private BigDecimal highPrice;

    @JsonAlias({"中價", "Mid_Price", "mid_price", "midPrice"})
    private BigDecimal midPrice;

    @JsonAlias({"下價", "Low_Price", "low_price", "lowPrice"})
    private BigDecimal lowPrice;

    // ====== Getters / Setters ======

    public String getCropCode() { return cropCode; }
    public void setCropCode(String cropCode) { this.cropCode = safeTrim(cropCode); }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = safeTrim(cropName); }

    public BigDecimal getAvgPrice() { return avgPrice; }
    public void setAvgPrice(BigDecimal avgPrice) { this.avgPrice = avgPrice; }

    // 支援字串型平均價
    @JsonAlias({"平均價(元)", "avg_price_text", "AvgPriceText"})
    public void setAvgPrice(String priceText) { this.avgPrice = parseNum(priceText); }

    public BigDecimal getHighPrice() { return highPrice; }
    public void setHighPrice(BigDecimal highPrice) { this.highPrice = highPrice; }
    public void setHighPrice(String s) { this.highPrice = parseNum(s); }

    public BigDecimal getMidPrice() { return midPrice; }
    public void setMidPrice(BigDecimal midPrice) { this.midPrice = midPrice; }
    public void setMidPrice(String s) { this.midPrice = parseNum(s); }

    public BigDecimal getLowPrice() { return lowPrice; }
    public void setLowPrice(BigDecimal lowPrice) { this.lowPrice = lowPrice; }
    public void setLowPrice(String s) { this.lowPrice = parseNum(s); }

    /**
     * 核心：先用平均價，如果沒有平均價就用(上+中+下)/3
     */
    public BigDecimal resolvePrice() {
        if (avgPrice != null) return avgPrice;

        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;
        if (highPrice != null) { sum = sum.add(highPrice); count++; }
        if (midPrice != null)  { sum = sum.add(midPrice);  count++; }
        if (lowPrice != null)  { sum = sum.add(lowPrice);  count++; }

        return count == 0 ? null : sum.divide(BigDecimal.valueOf(count), 2, BigDecimal.ROUND_HALF_UP);
    }

    private static String safeTrim(String s) {
        return s == null ? null : s.trim();
    }

    private static BigDecimal parseNum(String raw) {
        if (raw == null) return null;
        String cleaned = raw.trim();
        if (cleaned.isEmpty() || cleaned.equals("-")) return null;
        cleaned = cleaned.replaceAll("[^0-9.\\-]", ""); // 去掉非數字/小數點/負號
        if (cleaned.isEmpty() || cleaned.equals(".") || cleaned.equals("-")) return null;
        try {
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Override
    public String toString() {
        return "OpenDataItem{" +
                "code='" + cropCode + '\'' +
                ", name='" + cropName + '\'' +
                ", avgPrice=" + avgPrice +
                ", highPrice=" + highPrice +
                ", midPrice=" + midPrice +
                ", lowPrice=" + lowPrice +
                '}';
    }
}
