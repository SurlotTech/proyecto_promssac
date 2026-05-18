package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.LoginRequest;
import com.promssac.backend.model.dto.response.LoginResponse;
import com.promssac.backend.service.UsuarioWebService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioWebService usuarioWebService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = usuarioWebService.login(request);
        return ResponseEntity.ok(response);
    }
}
