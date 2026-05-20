package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.NotificationSendRequest;
import com.promssac.backend.model.dto.response.NotificationSendResponse;
import com.promssac.backend.model.dto.response.NotificacionEnviadaListResponse;
import com.promssac.backend.model.dto.response.PagedResponse;
import com.promssac.backend.service.MailerSendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notificaciones")
@RequiredArgsConstructor
public class NotificationController {

    private final MailerSendService mailerSendService;

    @PostMapping("/enviar")
    public ResponseEntity<NotificationSendResponse> enviar(
            @Valid @RequestBody NotificationSendRequest request) {
        return ResponseEntity.ok(mailerSendService.enviar(request));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<NotificacionEnviadaListResponse>> listar(
            @PageableDefault(size = 20, sort = "enviadoEn", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<NotificacionEnviadaListResponse> page = mailerSendService.listarEnviadas(pageable);
        return ResponseEntity.ok(PagedResponse.from(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificacionEnviadaListResponse> detalle(@PathVariable String id) {
        return ResponseEntity.ok(mailerSendService.obtenerPorId(id));
    }
}
