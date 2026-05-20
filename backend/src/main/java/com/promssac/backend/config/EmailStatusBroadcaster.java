package com.promssac.backend.config;

import com.promssac.backend.integration.mailersend.EmailHealthChecker;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailStatusBroadcaster {

    private final EmailHealthChecker healthChecker;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedDelay = 30_000, initialDelay = 2_000)
    public void verificarYBloadcast() {
        boolean activo = healthChecker.verificar();
        messagingTemplate.convertAndSend("/topic/email-status",
                Map.of("activo", activo));
        log.debug("Email status broadcast: {}", activo ? "ACTIVO" : "INACTIVO");
    }
}
