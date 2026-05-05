package com.promssac.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.model.dto.response.GeocodificacionDto;
import com.promssac.backend.service.NominatimGeocodificacionService;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class NominatimGeocodificacionServiceImpl implements NominatimGeocodificacionService {

    private static final String USER_AGENT = "PROMSSAC/1.0 (backend operaciones; contacto local)";
    private static final String BASE = "https://nominatim.openstreetmap.org";

    private final ObjectMapper objectMapper;

    @Override
    public GeocodificacionDto reversa(double lat, double lon) {
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            throw new BusinessException("Coordenadas fuera de rango.");
        }
        String uri = UriComponentsBuilder.fromHttpUrl(BASE + "/reverse")
                .queryParam("format", "jsonv2")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("accept-language", "es")
                .build(true)
                .toUriString();
        return ejecutarGet(uri);
    }

    @Override
    public GeocodificacionDto buscar(String consulta) {
        String q = consulta == null ? "" : consulta.trim();
        if (q.length() < 4) {
            throw new BusinessException("Escribe al menos 4 caracteres para buscar.");
        }
        String uri = UriComponentsBuilder.fromHttpUrl(BASE + "/search")
                .queryParam("format", "jsonv2")
                .queryParam("q", q)
                .queryParam("limit", 1)
                .queryParam("countrycodes", "pe")
                .queryParam("accept-language", "es")
                .build()
                .toUriString();
        return ejecutarBusqueda(uri);
    }

    private GeocodificacionDto ejecutarGet(String uri) {
        try {
            RestClient client = RestClient.builder().build();
            String body = client
                    .get()
                    .uri(uri)
                    .header(HttpHeaders.USER_AGENT, USER_AGENT)
                    .retrieve()
                    .body(String.class);
            if (body == null || body.isBlank()) {
                throw new BusinessException("Sin respuesta del servicio de mapas.");
            }
            JsonNode root = objectMapper.readTree(body);
            return parseUnResultado(root, false);
        } catch (RestClientResponseException e) {
            log.warn("Nominatim HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString(StandardCharsets.UTF_8));
            throw new BusinessException("No se pudo obtener la dirección en esta ubicación.");
        } catch (Exception e) {
            if (e instanceof BusinessException be) {
                throw be;
            }
            log.warn("Nominatim reverse: {}", e.getMessage());
            throw new BusinessException("Error al consultar la ubicación.");
        }
    }

    private GeocodificacionDto ejecutarBusqueda(String uri) {
        try {
            RestClient client = RestClient.builder().build();
            String body = client
                    .get()
                    .uri(uri)
                    .header(HttpHeaders.USER_AGENT, USER_AGENT)
                    .retrieve()
                    .body(String.class);
            if (body == null || body.isBlank()) {
                throw new BusinessException("Sin resultados.");
            }
            JsonNode root = objectMapper.readTree(body);
            if (!root.isArray() || root.isEmpty()) {
                throw new BusinessException("No se encontró esa dirección. Prueba otra referencia o ubica en el mapa.");
            }
            return parseUnResultado(root.get(0), true);
        } catch (RestClientResponseException e) {
            log.warn("Nominatim search HTTP {}", e.getStatusCode());
            throw new BusinessException("No se pudo buscar la dirección.");
        } catch (Exception e) {
            if (e instanceof BusinessException be) {
                throw be;
            }
            log.warn("Nominatim search: {}", e.getMessage());
            throw new BusinessException("Error al buscar la dirección.");
        }
    }

    private GeocodificacionDto parseUnResultado(JsonNode node, boolean fromSearch) {
        if (node == null || node.isMissingNode()) {
            throw new BusinessException("Ubicación sin datos.");
        }
        if (node.has("error")) {
            throw new BusinessException(node.path("error").asText("Ubicación no encontrada."));
        }
        String display = node.path("display_name").asText("").trim();
        if (display.isEmpty()) {
            throw new BusinessException("No hay dirección legible para este punto.");
        }
        double lat = node.path("lat").asDouble(Double.NaN);
        double lon = node.path("lon").asDouble(Double.NaN);
        if (Double.isNaN(lat) || Double.isNaN(lon)) {
            throw new BusinessException("Coordenadas inválidas en la respuesta.");
        }
        return new GeocodificacionDto(display, lat, lon);
    }
}
