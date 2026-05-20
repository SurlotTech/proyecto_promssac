package com.promssac.backend.controller;

import com.promssac.backend.model.dto.request.UbicacionUsuarioRequest;
import com.promssac.backend.model.dto.response.UbicacionUsuarioResponse;
import com.promssac.backend.security.WebUserDetails;
import com.promssac.backend.service.GpsService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gps")
@RequiredArgsConstructor
@Validated
public class GpsController {

    private final GpsService gpsService;

    @PostMapping("/ubicacion")
    public ResponseEntity<java.util.Map<String, String>> enviarUbicacion(@Valid @RequestBody UbicacionUsuarioRequest request) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof WebUserDetails user) {
            gpsService.registrarUbicacion(user.getId(), user.getNombreCompleto(), request);
        }
        return ResponseEntity.ok(java.util.Map.of("ok", "true"));
    }

    @GetMapping("/ubicaciones")
    public ResponseEntity<List<UbicacionUsuarioResponse>> listarUbicaciones() {
        return ResponseEntity.ok(gpsService.listarUbicaciones());
    }

    @DeleteMapping("/ubicacion")
    public ResponseEntity<java.util.Map<String, String>> eliminarUbicacion() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof WebUserDetails user) {
            gpsService.eliminarUbicacion(user.getId());
        }
        return ResponseEntity.ok(java.util.Map.of("ok", "true"));
    }
}
