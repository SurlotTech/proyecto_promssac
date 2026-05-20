package com.promssac.backend.config;

import com.promssac.backend.security.JwtTokenProvider;
import com.promssac.backend.security.WebUserDetails;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.util.StringUtils;

@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final int MAX_SESSIONS_PER_USER = 1;

    private final JwtTokenProvider jwtTokenProvider;
    private final Map<String, Integer> sessionCount = new ConcurrentHashMap<>();

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        if (command == null) {
            return message;
        }

        return switch (command) {
            case CONNECT -> manejarConnect(message, accessor);
            case SUBSCRIBE -> manejarSubscribe(message, accessor);
            case SEND -> manejarSend(message, accessor);
            case DISCONNECT -> manejarDisconnect(message, accessor);
            default -> message;
        };
    }

    private Message<?> manejarConnect(Message<?> message, StompHeaderAccessor accessor) {
        String token = extraerToken(accessor);
        if (!StringUtils.hasText(token)) {
            log.warn("STOMP CONNECT rechazado: sin token de autenticacion");
            return rechazar(accessor, "Token de autenticacion requerido");
        }

        try {
            WebUserDetails userDetails = jwtTokenProvider.validarToken(token);

            String userId = userDetails.getId() != null ? userDetails.getId() : userDetails.getUsername();
            int count = sessionCount.merge(userId, 1, Integer::sum);
            if (count > MAX_SESSIONS_PER_USER) {
                sessionCount.merge(userId, -1, Integer::sum);
                log.warn("STOMP CONNECT rechazado: demasiadas sesiones para usuario={}", userId);
                return rechazar(accessor, "Demasiadas sesiones activas");
            }

            Principal principal = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            accessor.setUser(principal);
            accessor.getSessionAttributes().put("userId", userId);
            log.info("STOMP CONNECT aceptado: usuario={}", userId);
            return message;

        } catch (Exception e) {
            log.warn("STOMP CONNECT rechazado: token invalido - {}", e.getMessage());
            return rechazar(accessor, "Token de autenticacion invalido o expirado");
        }
    }

    private Message<?> manejarSubscribe(Message<?> message, StompHeaderAccessor accessor) {
        Principal user = accessor.getUser();
        String destination = accessor.getDestination();
        if (user == null) {
            log.warn("STOMP SUBSCRIBE rechazado: no autenticado para destino={}", destination);
            return rechazar(accessor, "No autorizado: debe autenticarse primero");
        }
        if (!esTopicPermitido(destination)) {
            log.warn("STOMP SUBSCRIBE rechazado: destino no autorizado={} por usuario={}",
                    destination, user.getName());
            return rechazar(accessor, "No autorizado para suscribirse a: " + destination);
        }
        return message;
    }

    private Message<?> manejarSend(Message<?> message, StompHeaderAccessor accessor) {
        Principal user = accessor.getUser();
        if (user == null) {
            log.warn("STOMP SEND rechazado: no autenticado");
            return rechazar(accessor, "No autorizado: debe autenticarse primero");
        }
        return message;
    }

    private Message<?> manejarDisconnect(Message<?> message, StompHeaderAccessor accessor) {
        String userId = (String) accessor.getSessionAttributes().get("userId");
        if (userId != null) {
            sessionCount.computeIfPresent(userId, (k, v) -> v <= 1 ? null : v - 1);
            log.debug("STOMP DISCONNECT: usuario={}", userId);
        }
        return message;
    }

    private boolean esTopicPermitido(String destination) {
        if (destination == null) return false;
        return destination.startsWith("/topic/email-status");
    }

    private Message<?> rechazar(StompHeaderAccessor accessor, String motivo) {
        StompHeaderAccessor errorAccessor = StompHeaderAccessor.create(StompCommand.ERROR);
        errorAccessor.setMessage(motivo);
        errorAccessor.setSessionId(accessor.getSessionId());
        return org.springframework.messaging.support.MessageBuilder.createMessage(
                new byte[0], errorAccessor.getMessageHeaders());
    }

    private String extraerToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String header = authHeaders.get(0);
            if (header.startsWith("Bearer ")) {
                return header.substring(7).trim();
            }
        }

        String queryToken = accessor.getFirstNativeHeader("token");
        if (StringUtils.hasText(queryToken)) {
            return queryToken.trim();
        }

        return null;
    }
}
