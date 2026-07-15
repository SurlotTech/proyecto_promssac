package com.promssac.backend.integration.orbitec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.config.OrbitecProperties;
import com.promssac.backend.model.dto.response.FleetDeviceResponse;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrbitecClient {

    private final OrbitecProperties properties;
    private final ObjectMapper objectMapper;

    private volatile RestClient restClient;
    private volatile String accessToken;

    private RestClient http() {
        if (restClient == null) {
            synchronized (this) {
                if (restClient == null) {
                    restClient = RestClient.builder()
                            .baseUrl(properties.getApiBaseUrl())
                            .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                            .defaultHeader(HttpHeaders.USER_AGENT, "PROMSSAC-SUTRACK/1.0")
                            .build();
                }
            }
        }
        return restClient;
    }

    public Optional<List<FleetDeviceResponse>> tryFetchDevicesLite() {
        if (!isReady()) {
            return Optional.empty();
        }
        try {
            List<FleetDeviceResponse> devices = fetchDevicesLite(false);
            return devices.isEmpty() ? Optional.empty() : Optional.of(devices);
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden e) {
            return retryAfterTokenExpired(e);
        } catch (RestClientException e) {
            log.warn("Orbitec devices-lite: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<List<FleetDeviceResponse>> retryAfterTokenExpired(RestClientException cause) {
        log.warn("Orbitec token inválido o vencido. Reintentando login automático: {}", cause.getMessage());
        accessToken = null;
        try {
            List<FleetDeviceResponse> devices = fetchDevicesLite(true);
            return devices.isEmpty() ? Optional.empty() : Optional.of(devices);
        } catch (RestClientException e) {
            log.warn("Orbitec devices-lite luego de re-login: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private List<FleetDeviceResponse> fetchDevicesLite(boolean forceLogin) {
        String token = token(forceLogin);
        return fetchDevicesPage(token, properties.getDevicesLimit());
    }

    private List<FleetDeviceResponse> fetchDevicesPage(String token, int limit) {
        String body = http().get()
                .uri(uriBuilder -> uriBuilder
                        .path("/devices-lite/")
                        .queryParam("limit", limit)
                        .queryParam("offset", 0)
                        .queryParam("ordering", properties.getDevicesOrdering())
                        .queryParamIfPresent(
                                "company__slug_name",
                                Optional.ofNullable(properties.getCompanySlugName()).filter(StringUtils::hasText))
                        .build())
                .header(HttpHeaders.AUTHORIZATION, "token " + token)
                .retrieve()
                .body(String.class);
        List<FleetDeviceResponse> devices = OrbitecFleetMapper.mapDevicesLite(body, objectMapper);
        log.debug("Orbitec devices-lite: {} unidades", devices.size());
        return devices;
    }

    private String token(boolean forceLogin) {
        if (!forceLogin && StringUtils.hasText(accessToken)) {
            return accessToken;
        }
        synchronized (this) {
            if (!forceLogin && StringUtils.hasText(accessToken)) {
                return accessToken;
            }
            accessToken = login();
            return accessToken;
        }
    }

    private String login() {
        String body = http().post()
                .uri("/users/login/")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("username", properties.getUsername(), "password", properties.getPassword()))
                .retrieve()
                .body(String.class);
        try {
            JsonNode root = objectMapper.readTree(body);
            String token = root.path("data").path("access_token").asText("");
            if (!StringUtils.hasText(token)) {
                throw new RestClientException("Orbitec no devolvió access_token.");
            }
            log.info("Login Orbitec exitoso para usuario={}", properties.getUsername());
            return token;
        } catch (RestClientException e) {
            throw e;
        } catch (Exception e) {
            throw new RestClientException("No se pudo parsear login Orbitec.", e);
        }
    }

    private boolean isReady() {
        return properties.isEnabled()
                && StringUtils.hasText(properties.getApiBaseUrl())
                && StringUtils.hasText(properties.getUsername())
                && StringUtils.hasText(properties.getPassword());
    }
}
