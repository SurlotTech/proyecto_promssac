package com.promssac.backend.security;

import com.promssac.backend.config.RateLimitConfig;
import com.promssac.backend.util.IpUtils;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitConfig rateLimitConfig;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = IpUtils.extractClientIp(request);
        Bucket bucket;

        if (request.getRequestURI().startsWith("/api/v1/auth/")) {
            bucket = rateLimitConfig.resolveLoginBucket(clientIp);
        } else {
            bucket = rateLimitConfig.resolveApiBucket(clientIp);
        }

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            long waitSeconds = Duration.ofNanos(probe.getNanosToWaitForRefill()).toSeconds();
            response.setHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(Math.max(waitSeconds, 1)));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{" +
                    "\"error\":\"Demasiadas solicitudes. Intenta de nuevo en " +
                    Math.max(waitSeconds, 1) + " segundo(s).\"}");
            log.warn("Rate limit excedido para IP={} en URI={}", clientIp, request.getRequestURI());
        }
    }
}
