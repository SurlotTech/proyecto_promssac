package com.promssac.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailStatusPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final ResendProperties resendProperties;

    @EventListener
    public void onSubscribe(SessionSubscribeEvent event) {
        String destination = event.getMessage().getHeaders().get("simpDestination", String.class);
        if (destination != null && destination.startsWith("/topic/email-status")) {
            boolean activo = resendProperties.isConfigured();
            messagingTemplate.convertAndSend("/topic/email-status",
                    Map.of("activo", activo));
        }
    }
}
