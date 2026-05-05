package com.promssac.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.promssac.backend.config.FactilizaProperties;
import com.promssac.backend.exception.BusinessException;
import com.promssac.backend.model.dto.response.DocumentoConsultaDto;
import com.promssac.backend.service.FactilizaConsultaService;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
@RequiredArgsConstructor
@Slf4j
public class FactilizaConsultaServiceImpl implements FactilizaConsultaService {

    private final FactilizaProperties props;
    private final ObjectMapper objectMapper;

    @Override
    public DocumentoConsultaDto consultarDni(String dni) {
        requireToken();
        if (!dni.matches("\\d{8}")) {
            throw new BusinessException("El DNI debe tener 8 dígitos.");
        }
        return ejecutarGet("/dni/info/" + dni, false);
    }

    @Override
    public DocumentoConsultaDto consultarRuc(String ruc) {
        requireToken();
        if (!ruc.matches("\\d{11}")) {
            throw new BusinessException("El RUC debe tener 11 dígitos.");
        }
        return ejecutarGet("/ruc/info/" + ruc, true);
    }

    private void requireToken() {
        if (props.getApiToken() == null || props.getApiToken().isBlank()) {
            throw new BusinessException(
                    "Consulta RENIEC/SUNAT no configurada. Defina PROMSSAC_FACTILIZA_TOKEN en el servidor.");
        }
    }

    private DocumentoConsultaDto ejecutarGet(String path, boolean esRuc) {
        try {
            RestClient client = RestClient.builder().baseUrl(props.getBaseUrl()).build();
            String body = client
                    .get()
                    .uri(path)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + props.getApiToken().trim())
                    .retrieve()
                    .body(String.class);
            if (body == null || body.isBlank()) {
                return new DocumentoConsultaDto(false, "Respuesta vacía del servicio.", null, null);
            }
            JsonNode root = objectMapper.readTree(body);
            return mapRespuesta(root, esRuc);
        } catch (RestClientResponseException e) {
            throw mapRestException(e);
        } catch (JsonProcessingException e) {
            log.warn("JSON Factiliza inválido: {}", e.getMessage());
            throw new BusinessException("Respuesta de consulta inválida.");
        }
    }

    private BusinessException mapRestException(RestClientResponseException e) {
        String raw = e.getResponseBodyAsString(StandardCharsets.UTF_8);
        try {
            JsonNode n = objectMapper.readTree(raw);
            String msg = n.path("message").asText(null);
            if (msg == null || msg.isBlank()) {
                msg = "Error al consultar el documento (" + e.getStatusCode().value() + ").";
            }
            return new BusinessException(msg);
        } catch (JsonProcessingException ex) {
            return new BusinessException("Error al consultar el servicio externo.");
        }
    }

    private DocumentoConsultaDto mapRespuesta(JsonNode root, boolean esRuc) {
        boolean ok = root.path("success").asBoolean(false);
        String message = root.path("message").asText("");
        JsonNode data = root.path("data");

        if (!ok || data.isMissingNode() || data.isNull()) {
            String msg = message.isBlank() ? "Consulta sin resultados." : message;
            return new DocumentoConsultaDto(false, msg, null, null);
        }

        String nombre;
        String direccion = text(data, "direccion_completa");

        if (esRuc) {
            nombre = text(data, "nombre_o_razon_social");
        } else {
            nombre = text(data, "nombre_completo");
            if (nombre == null || nombre.isBlank()) {
                String n = text(data, "nombres");
                String ap1 = text(data, "apellido_paterno");
                String ap2 = text(data, "apellido_materno");
                String joined = Stream.of(n, ap1, ap2)
                        .filter(s -> s != null && !s.isBlank())
                        .collect(Collectors.joining(" "));
                nombre = joined.isBlank() ? null : joined;
            }
        }

        return new DocumentoConsultaDto(true, null, nombre, direccion);
    }

    private static String text(JsonNode parent, String field) {
        JsonNode v = parent.path(field);
        if (v.isMissingNode() || v.isNull()) {
            return null;
        }
        String s = v.asText(null);
        return s != null && !s.isBlank() ? s.trim() : null;
    }
}
