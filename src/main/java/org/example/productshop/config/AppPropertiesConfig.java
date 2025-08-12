package org.example.productshop.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

    @Configuration
    @ConfigurationProperties(prefix = "app")
    public class AppPropertiesConfig {
        private List<String> cropCodes = new ArrayList<>();
        public List<String> getCropCodes() { return cropCodes; }
        public void setCropCodes(List<String> cropCodes) { this.cropCodes = cropCodes; }
    }

