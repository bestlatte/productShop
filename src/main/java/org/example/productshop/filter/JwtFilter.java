package org.example.productshop.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.productshop.api.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtFilter implements Filter {

    @Autowired
    private JwtUtil jwtUtil;

    // 白名單路徑（不需要驗證 JWT）
    private static final List<String> WHITELIST = Arrays.asList(
            "/users/register",
            "/users/login",
            "/users/verify",
            "/users/resend-verification",
            "/users/password/reset/request",
            "/users/password/reset/confirm",
            "/error",
            "/",
            "/index.html",
            "/login.html",
            "/register.html",
            "/favicon.ico",
            "/CSS/",
            "/JS/",
            "/img/",
            "/api/cart/add",  // ← 測試用放行購物車新增
            "/api/products/search",  // ← 測試用搜尋商品
            "/api/products/{productId}/prices", // ← 價格自動更新
            "/api/cart/remove" // 移除購物車
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // 加上 CORS Header（不管成功或失敗都加）
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:63342");
//      res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", "true");

        // 如果是預檢請求，直接回 200
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String path = req.getRequestURI();

        // 白名單 API 直接放行
        if (WHITELIST.stream().anyMatch(path::startsWith)) {
            if (WHITELIST.stream().anyMatch(whitelistPath -> {
                if (whitelistPath.endsWith("/")) {
                    return path.startsWith(whitelistPath);
                } else {
                    return path.equals(whitelistPath) || path.startsWith(whitelistPath);
                }
            })) {
                chain.doFilter(request, response);
                return;
            }}

        // 驗證 Token
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (jwtUtil.validateToken(token)) {
                    // 驗證成功，可以將用戶信息設置到request中供後續使用
                    String email = jwtUtil.getEmailFromToken(token);
                    req.setAttribute("userEmail", email);
                    chain.doFilter(request, response);
                    return;
                }
            } catch (Exception e) {
                // Token 驗證失敗
                e.printStackTrace();
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.setContentType("application/json");
                res.getWriter().write("{\"error\":\"Invalid token\"}");
                return;
            }
        }

        // 沒有提供 Token 或驗證失敗
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType("application/json");
        res.getWriter().write("{\"error\":\"Authorization header required\"}");
    }
}
