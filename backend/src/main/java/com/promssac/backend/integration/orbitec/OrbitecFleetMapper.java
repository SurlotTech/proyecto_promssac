package com.promssac.backend.integration.orbitec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.model.dto.response.FleetDeviceResponse;
import com.promssac.backend.time.FleetTimeZones;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class OrbitecFleetMapper {

    private static final DateTimeFormatter ORBITEC_DATE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public static List<FleetDeviceResponse> mapDevicesLite(String jsonBody, ObjectMapper objectMapper) {
        List<FleetDeviceResponse> out = new ArrayList<>();
        if (!StringUtils.hasText(jsonBody)) {
            return out;
        }
        try {
            JsonNode results = objectMapper.readTree(jsonBody).path("data").path("results");
            if (!results.isArray()) {
                return out;
            }
            for (JsonNode d : results) {
                out.add(mapOneDevice(d));
            }
        } catch (Exception e) {
            log.warn("No se pudo parsear respuesta Orbitec devices-lite: {}", e.getMessage());
        }
        return out;
    }

    private static FleetDeviceResponse mapOneDevice(JsonNode d) {
        JsonNode gps = d.path("gps");
        JsonNode vehicle = d.path("vehicle");
        JsonNode location = d.path("last_location").path("coordinates");
        double lat = location.isArray() && location.size() > 0 ? location.get(0).asDouble(0) : 0;
        double lng = location.isArray() && location.size() > 1 ? location.get(1).asDouble(0) : 0;
        Double speed = readDoubleNullable(d, "last_speed");
        int batteryPct = clampPct((int) Math.round(d.path("last_battery_level").asDouble(0)));

        return new FleetDeviceResponse(
                text(d, "id"),
                firstNonBlank(text(vehicle, "plate"), text(d, "name"), text(gps, "imei")),
                text(gps, "imei"),
                lat,
                lng,
                mapStatus(d, speed),
                batteryPct,
                signalBars(d.path("gps_conexion").asBoolean(false)),
                parseLastSeen(text(d, "last_timestamp")).toString(),
                firstNonBlank(text(d, "name"), text(vehicle, "plate")),
                speed);
    }

    private static String mapStatus(JsonNode d, Double speed) {
        if (!d.path("gps_conexion").asBoolean(false)) {
            return "offline";
        }
        String slug = d.path("last_status_code").path("slug_name").asText("");
        if ("driving".equalsIgnoreCase(slug) || (speed != null && speed > 3)) {
            return "in_route";
        }
        return "stopped";
    }

    private static Instant parseLastSeen(String raw) {
        if (!StringUtils.hasText(raw)) {
            return Instant.now();
        }
        try {
            return LocalDateTime.parse(raw, ORBITEC_DATE)
                    .atZone(FleetTimeZones.AMERICA_LIMA)
                    .toInstant();
        } catch (Exception e) {
            return Instant.now();
        }
    }

    private static Double readDoubleNullable(JsonNode d, String field) {
        JsonNode n = d.get(field);
        return n == null || n.isNull() || n.isMissingNode() ? null : n.asDouble();
    }

    private static int signalBars(boolean connected) {
        return connected ? 4 : 1;
    }

    private static int clampPct(int v) {
        return Math.max(0, Math.min(100, v));
    }

    private static String text(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return v == null || v.isNull() ? "" : v.asText("").trim();
    }

    private static String firstNonBlank(String... parts) {
        for (String p : parts) {
            if (StringUtils.hasText(p)) {
                return p.trim().toUpperCase();
            }
        }
        return "";
    }
}
