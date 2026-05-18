package com.promssac.backend.security;

import com.promssac.backend.util.IpUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.regex.Pattern;

@Component
@Slf4j
@Order(0)
public class UrlSecurityFilter extends OncePerRequestFilter {

    private static final Pattern PATH_TRAVERSAL = Pattern.compile(
            "(\\.\\./|\\.\\.\\\\|%2e%2e[/\\\\]|%2e%2e%2f|%2e%2e%5c)", Pattern.CASE_INSENSITIVE);
    private static final Pattern SQL_INJECTION_URL = Pattern.compile(
            "('|%27|\\bunion\\b|\\bselect\\b|\\bdrop\\b|\\bdelete\\b|\\binsert\\b|\\bupdate\\b|\\bexec\\b|\\bexecute\\b|--|;--|%23)",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern SCRIPT_TAG = Pattern.compile(
            "(<script|%3Cscript|javascript:|vbscript:|onload=|onerror=)", Pattern.CASE_INSENSITIVE);
    private static final Pattern NULL_BYTE = Pattern.compile("%00|\\x00");
    private static final Pattern SUSPICIOUS_ENCODING = Pattern.compile(
            "(%[0-9a-f]{2}){10,}", Pattern.CASE_INSENSITIVE);

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String fullTarget = query != null ? uri + "?" + query : uri;

        if (PATH_TRAVERSAL.matcher(fullTarget).find()) {
            log.warn("Path traversal detectado IP={} URI={}", IpUtils.extractClientIp(request), fullTarget);
            sendBlocked(response, "Solicitud rechazada por contener patrones de navegacion de directorios.");
            return;
        }

        if (NULL_BYTE.matcher(fullTarget).find()) {
            log.warn("Null byte detectado IP={} URI={}", IpUtils.extractClientIp(request), fullTarget);
            sendBlocked(response, "Solicitud rechazada por caracteres invalidos.");
            return;
        }

        if (SUSPICIOUS_ENCODING.matcher(fullTarget).find()) {
            log.warn("Codificacion excesiva detectada IP={} URI={}", IpUtils.extractClientIp(request), fullTarget);
            sendBlocked(response, "Solicitud rechazada por codificacion sospechosa.");
            return;
        }

        if (SCRIPT_TAG.matcher(fullTarget).find()) {
            log.warn("XSS detectado en URL IP={} URI={}", IpUtils.extractClientIp(request), fullTarget);
            sendBlocked(response, "Solicitud rechazada por contener patrones no permitidos.");
            return;
        }

        if (SQL_INJECTION_URL.matcher(fullTarget).find()) {
            log.warn("SQL injection en URL detectado IP={} URI={}", IpUtils.extractClientIp(request), fullTarget);
            sendBlocked(response, "Solicitud rechazada por contener patrones no permitidos.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendBlocked(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.BAD_REQUEST.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/");
    }
}
