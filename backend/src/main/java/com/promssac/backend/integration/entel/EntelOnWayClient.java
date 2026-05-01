package com.promssac.backend.integration.entel;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.config.EntelOnWayProperties;
import com.promssac.backend.model.dto.response.FleetDeviceResponse;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
@Slf4j
public class EntelOnWayClient {

    private final EntelOnWayProperties properties;
    private final ObjectMapper objectMapper;

    private volatile RestClient restClient;

    private RestClient http() {
        if (restClient == null) {
            synchronized (this) {
                if (restClient == null) {
                    restClient = RestClient.builder()
                            .baseUrl(properties.getBaseUrl())
                            .defaultHeader(
                                    HttpHeaders.USER_AGENT,
                                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                                            + "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                            .defaultHeader(HttpHeaders.ACCEPT, "application/json, text/javascript, */*; q=0.01")
                            .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "es-PE,es;q=0.9")
                            .build();
                }
            }
        }
        return restClient;
    }

    public Optional<List<FleetDeviceResponse>> tryFetchDevicesByGroup() {
        return tryFetch(
                () -> fetchDevicesByGroup(properties.getGroupId()),
                "GetOnlineDevicesInfoByUserByGroup");
    }

    public Optional<List<FleetDeviceResponse>> tryFetchDevicesForMap() {
        return tryFetch(this::fetchDevicesForMapInternal, "GetOnlineDevicesInfoByUserForMap");
    }

    private Optional<List<FleetDeviceResponse>> tryFetch(
            Supplier<List<FleetDeviceResponse>> supplier, String operation) {
        if (!properties.isEnabled() || !StringUtils.hasText(properties.getCookie())) {
            return Optional.empty();
        }
        try {
            List<FleetDeviceResponse> list = supplier.get();
            return list.isEmpty() ? Optional.empty() : Optional.of(list);
        } catch (RestClientException e) {
            log.warn("OnWay {}: {}", operation, e.getMessage());
            return Optional.empty();
        }
    }

    private List<FleetDeviceResponse> fetchDevicesByGroup(long groupId) {
        long noCache = System.currentTimeMillis();
        String path = "/OnlineTracking/GetOnlineDevicesInfoByUserByGroup/"
                + "?noCache=" + noCache
                + "&groupId=" + groupId
                + "&_=" + (noCache - 1);

        String body = http().get()
                .uri(path)
                .header(HttpHeaders.COOKIE, properties.getCookie())
                .header(HttpHeaders.REFERER, properties.getBaseUrl() + "/")
                .retrieve()
                .body(String.class);
        List<FleetDeviceResponse> list = EntelFleetMapper.mapDevicesArray(body, objectMapper);
        log.debug("OnWay byGroup: {} unidades", list.size());
        return list;
    }

    private List<FleetDeviceResponse> fetchDevicesForMapInternal() {
        String body = http().post()
                .uri("/OnlineTracking/GetOnlineDevicesInfoByUserForMap/")
                .header(HttpHeaders.COOKIE, properties.getCookie())
                .header(HttpHeaders.REFERER, properties.getBaseUrl() + "/")
                .contentType(MediaType.APPLICATION_JSON)
                .body("{}")
                .retrieve()
                .body(String.class);
        return EntelFleetMapper.mapDevicesArray(body, objectMapper);
    }
}
