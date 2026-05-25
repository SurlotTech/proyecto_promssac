package com.promssac.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(2)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("X-Permitted-Cross-Domain-Policies", "none");
        response.setHeader("Permissions-Policy",
                "camera=(), microphone=(), geolocation=(), payment=()");
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
        response.setHeader("X-Powered-By", "Sulort Tech S.A.C");

        filterChain.doFilter(request, response);
    }
}
