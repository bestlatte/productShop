package org.example.productshop.job;

import org.example.productshop.service.OpenDataPriceSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PriceSyncJob {
    @Autowired
    private OpenDataPriceSyncService service;

    // 每小時第 5 分自動更新（避免整點塞車）
    // 秒 分 時 日 月 週
    @Scheduled(cron = "0 5 * * * *")
    public void hourlySync() {
        try {
            int n = service.sync();
            System.out.println("[PriceSyncJob] updated rows = " + n);
        } catch (Exception e) {
            // 讓你的 GlobalHandler 不用背鍋，這裡自己記錄
            e.printStackTrace();
        }
    }
}
