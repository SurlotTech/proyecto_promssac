package com.promssac.backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitConfig {

    @Getter
    private final int loginMaxPerMinute;

    @Getter
    private final int apiMaxPerMinute;

    @Getter
    private final int apiMaxBurst;

    @Getter
    private final int loginMaxBurst;

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> apiBuckets = new ConcurrentHashMap<>();

    public RateLimitConfig(
            @Value("${app.rate-limit.login-per-minute:5}") int loginMaxPerMinute,
            @Value("${app.rate-limit.api-per-minute:120}") int apiMaxPerMinute,
            @Value("${app.rate-limit.api-burst:30}") int apiMaxBurst,
            @Value("${app.rate-limit.login-burst:3}") int loginMaxBurst) {
        this.loginMaxPerMinute = loginMaxPerMinute;
        this.apiMaxPerMinute = apiMaxPerMinute;
        this.apiMaxBurst = apiMaxBurst;
        this.loginMaxBurst = loginMaxBurst;
    }

    public Bucket resolveLoginBucket(String clientIp) {
        return loginBuckets.computeIfAbsent(clientIp, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(loginMaxBurst,
                        Refill.intervally(loginMaxPerMinute, Duration.ofMinutes(1))))
                .build());
    }

    public Bucket resolveApiBucket(String clientIp) {
        return apiBuckets.computeIfAbsent(clientIp, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(apiMaxBurst,
                        Refill.intervally(apiMaxPerMinute, Duration.ofMinutes(1))))
                .build());
    }

    @Scheduled(fixedRate = 600_000)
    public void clearExpired() {
        int beforeLogin = loginBuckets.size();
        int beforeApi = apiBuckets.size();
        loginBuckets.entrySet().removeIf(e -> e.getValue().getAvailableTokens() > loginMaxBurst * 2);
        apiBuckets.entrySet().removeIf(e -> e.getValue().getAvailableTokens() > apiMaxBurst * 2);
        log.debug("Rate limit cleanup: login {}→{}, api {}→{}",
                beforeLogin, loginBuckets.size(), beforeApi, apiBuckets.size());
    }
}
