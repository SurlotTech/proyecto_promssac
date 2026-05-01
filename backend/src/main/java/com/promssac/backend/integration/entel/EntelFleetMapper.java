package com.promssac.backend.integration.entel;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.model.dto.response.FleetDeviceResponse;
import com.promssac.backend.time.FleetTimeZones;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

/**
 * Mapea el JSON de OnWay (lista {@code devices}) a {@link FleetDeviceResponse}.
 */
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class EntelFleetMapper {

    private static final String DEVICES = "devices";
    private static final String IMEI = "imei";
    private static final String SPEED = "speed";
    private static final String DOT_NET_DATE_PREFIX = "/Date(";

    public static List<FleetDeviceResponse> mapDevicesArray(String jsonBody, ObjectMapper objectMapper) {
        List<FleetDeviceResponse> out = new ArrayList<>();
        if (!StringUtils.hasText(jsonBody)) {
            return out;
        }
        if (isHtmlPayload(jsonBody)) {
            log.warn(
                    "OnWay devolvió HTML (no JSON): cookie/sesión inválida o caducada, o redirección a login. "
                            + "Actualiza promssac.entel.onway.cookie / PROMSSAC_ENTEL_ONWAY_COOKIE o desactiva "
                            + "promssac.entel.onway.enabled; se usará la base local si hay datos.");
            return out;
        }
        try {
            JsonNode devices = objectMapper.readTree(jsonBody).path(DEVICES);
            if (!devices.isArray()) {
                return out;
            }
            for (JsonNode d : devices) {
                out.add(mapOneDevice(d));
            }
        } catch (Exception e) {
            log.warn("No se pudo parsear respuesta OnWay: {}", e.getMessage());
        }
        return out;
    }

    private static boolean isHtmlPayload(String body) {
        String t = body.stripLeading();
        return !t.isEmpty() && t.charAt(0) == '<';
    }

    private static FleetDeviceResponse mapOneDevice(JsonNode d) {
        String imei = text(d, IMEI);
        String id = resolveDeviceId(d, imei);
        String plate = resolvePlate(d, imei);
        Coords coords = readCoords(d);
        String status = mapFleetStatus(d);
        String alias = resolveAlias(d);
        Double speedKmh = readSpeedKmhNullable(d);
        int batteryPct = resolveBatteryPct(d);
        int signalBars = signalBarsFromPct(batteryPct);
        String lastSeenIso = resolveLastSeenInstant(d).toString();

        return new FleetDeviceResponse(
                id,
                plate,
                imei,
                coords.lat(),
                coords.lng(),
                status,
                batteryPct,
                signalBars,
                lastSeenIso,
                alias,
                speedKmh);
    }

    private static String resolveDeviceId(JsonNode d, String imei) {
        long deviceId = d.path("device_id").asLong(0);
        return deviceId > 0 ? Long.toString(deviceId) : imei;
    }

    private static String resolvePlate(JsonNode d, String imei) {
        return firstNonBlank(text(d, "automotor_plate"), text(d, "alias"), imei);
    }

    private static String resolveAlias(JsonNode d) {
        String raw = text(d, "alias");
        return StringUtils.hasText(raw) ? raw : null;
    }

    private static Coords readCoords(JsonNode d) {
        return new Coords(d.path("latitude").asDouble(), d.path("longitude").asDouble());
    }

    private record Coords(double lat, double lng) {}

    private static String mapFleetStatus(JsonNode d) {
        String active = text(d, "active");
        double speed = d.path(SPEED).asDouble(0);
        if (!StringUtils.hasText(active) || "OFFLINE".equalsIgnoreCase(active)) {
            return "offline";
        }
        if ("ONLINE".equalsIgnoreCase(active) && speed > 3) {
            return "in_route";
        }
        if ("ONLINE".equalsIgnoreCase(active)) {
            return "stopped";
        }
        return "offline";
    }

    private static Double readSpeedKmhNullable(JsonNode d) {
        JsonNode n = d.get(SPEED);
        if (n == null || n.isNull() || n.isMissingNode()) {
            return null;
        }
        return n.asDouble();
    }

    /**
     * OnWay /Date(ms)/: el epoch se interpreta como dígitos civiles en Perú; se obtiene el instante UTC real.
     */
    private static Instant resolveLastSeenInstant(JsonNode d) {
        Instant gps = parseDotNetMillis(d.get("gps_message_time"));
        Instant gprs = parseDotNetMillis(d.get("gprs_message_time"));
        Instant entry = parseDotNetMillis(d.get("entry_time"));
        if (allEpoch(gps, gprs, entry)) {
            return Instant.now();
        }
        Instant best = maxInstant(gps, gprs, entry);
        LocalDateTime digitsAsUtcWall = LocalDateTime.ofInstant(best, ZoneOffset.UTC);
        return digitsAsUtcWall.atZone(FleetTimeZones.AMERICA_LIMA).toInstant();
    }

    private static boolean allEpoch(Instant a, Instant b, Instant c) {
        return a.equals(Instant.EPOCH) && b.equals(Instant.EPOCH) && c.equals(Instant.EPOCH);
    }

    private static Instant maxInstant(Instant a, Instant b, Instant c) {
        Instant best = Instant.EPOCH;
        for (Instant x : List.of(a, b, c)) {
            if (x.isAfter(best)) {
                best = x;
            }
        }
        return best;
    }

    private static Instant parseDotNetMillis(JsonNode node) {
        if (node == null || node.isNull()) {
            return Instant.EPOCH;
        }
        String s = node.asText("");
        if (!s.startsWith(DOT_NET_DATE_PREFIX)) {
            return Instant.EPOCH;
        }
        String inner = dotNetMillisSubstring(s);
        if (inner == null) {
            return Instant.EPOCH;
        }
        try {
            return Instant.ofEpochMilli(Long.parseLong(inner));
        } catch (NumberFormatException e) {
            return Instant.EPOCH;
        }
    }

    /** Extrae el número de ms entre {@code /Date(} y {@code )}, sin sufijo {@code +0000}. */
    private static String dotNetMillisSubstring(String s) {
        int open = s.indexOf('(');
        int close = s.indexOf(')', open + 1);
        if (open < 0 || close <= open) {
            return null;
        }
        return s.substring(open + 1, close).replace("+0000", "").trim();
    }

    private static int resolveBatteryPct(JsonNode d) {
        if (d.path("external_battery_level_valid").asBoolean(false)) {
            return clampPct(d.path("external_battery_level").asInt(0));
        }
        return clampPct(d.path("internal_battery_level").asInt(0));
    }

    private static int clampPct(int v) {
        return Math.max(0, Math.min(100, v));
    }

    private static int signalBarsFromPct(int pct) {
        if (pct <= 0) {
            return 1;
        }
        int b = (pct + 24) / 25;
        return Math.min(4, Math.max(1, b));
    }

    private static String text(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return v == null || v.isNull() ? "" : v.asText("").trim();
    }

    private static String firstNonBlank(String... parts) {
        for (String p : parts) {
            if (StringUtils.hasText(p)) {
                return p;
            }
        }
        return "";
    }
}
