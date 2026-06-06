package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.NotificationSendRequest;
import com.promssac.backend.model.dto.response.NotificationSendResponse;
import com.promssac.backend.model.dto.response.NotificacionEnviadaListResponse;
import com.promssac.backend.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notificaciones")
@Validated
@RequiredArgsConstructor
public class NotificacionController {

    private final EmailService emailService;

    @GetMapping
    public ResponseEntity<Page<NotificacionEnviadaListResponse>> listar(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "enviadoEn"));
        return ResponseEntity.ok(emailService.listarEnviadas(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificacionEnviadaListResponse> obtenerPorId(@PathVariable String id) {
        return ResponseEntity.ok(emailService.obtenerPorId(id));
    }

    @PostMapping("/enviar")
    public ResponseEntity<NotificationSendResponse> enviar(@Valid @RequestBody NotificationSendRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emailService.enviar(request));
    }
}
