package com.promssac.backend.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
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

    private final ObjectMapper objectMapper;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
            ObjectMapper objectMapper) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.objectMapper = objectMapper;
    }

    public String crearToken(WebUserDetails userDetails) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        String permisosJson;
        try {
            permisosJson = objectMapper.writeValueAsString(userDetails.getPermissions());
        } catch (JsonProcessingException e) {
            permisosJson = "{}";
        }

        String token = Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("uid", userDetails.getId())
                .claim("name", userDetails.getNombreCompleto())
                .claim("email", userDetails.getEmail())
                .claim("rol", userDetails.getRolNombre())
                .claim("perms", permisosJson)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
        log.debug("JWT emitido para usuario={}", userDetails.getUsername());
        return token;
    }

    public WebUserDetails validarToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String permisosJson = claims.get("perms", String.class);
        Map<String, Boolean> permisos;
        try {
            permisos = objectMapper.readValue(
                    permisosJson != null ? permisosJson : "{}",
                    new TypeReference<Map<String, Boolean>>() {});
        } catch (JsonProcessingException e) {
            permisos = Map.of();
        }

        return new WebUserDetails(
                claims.get("uid", String.class),
                claims.getSubject(),
                "",
                claims.get("name", String.class),
                claims.get("email", String.class),
                claims.get("rol", String.class),
                permisos,
                true
        );
    }
}
