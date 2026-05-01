package com.promssac.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey key;

    @Getter
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String crearToken(String subject) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        String token = Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
        log.trace("JWT emitido subject={}", subject);
        return token;
    }
}
