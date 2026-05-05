package com.promssac.backend.controller;

import com.promssac.backend.model.dto.response.GeocodificacionDto;
import com.promssac.backend.service.NominatimGeocodificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/geocodificacion")
@RequiredArgsConstructor
public class GeocodificacionController {

    private final NominatimGeocodificacionService nominatimGeocodificacionService;

    @GetMapping("/reversa")
    public GeocodificacionDto reversa(
            @RequestParam("lat") double lat, @RequestParam("lon") double lon) {
        return nominatimGeocodificacionService.reversa(lat, lon);
    }

    @GetMapping("/buscar")
    public GeocodificacionDto buscar(@RequestParam("q") String q) {
        return nominatimGeocodificacionService.buscar(q);
    }
}
