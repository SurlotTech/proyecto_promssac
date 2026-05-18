package com.promssac.backend.exception;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @Value("${app.error.include-details:false}")
    private boolean includeErrorDetails;

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> manejarValidacion(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .findFirst()
                .orElse("Peticion invalida");
        log.warn("Validacion fallida: {}", msg);
        return Map.of("error", msg);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Map<String, String> manejarJsonMalformado(HttpMessageNotReadableException ex) {
        log.warn("JSON malformado: {}", ex.getMessage());
        return Map.of("error", "Cuerpo de la peticion invalido o malformado.");
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public Map<String, String> manejarParametroFaltante(MissingServletRequestParameterException ex) {
        log.warn("Parametro requerido faltante: {}", ex.getParameterName());
        return Map.of("error", "Falta el parametro requerido: " + ex.getParameterName());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public Map<String, String> manejarTipoIncorrecto(MethodArgumentTypeMismatchException ex) {
        log.warn("Tipo de parametro incorrecto: {} ({}).", ex.getName(), ex.getValue());
        return Map.of("error", "El valor '" + ex.getValue() + "' no es valido para el parametro '" + ex.getName() + "'.");
    }

    @ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public Map<String, String> manejarTamanoMultipart(MaxUploadSizeExceededException ex) {
        log.warn("Archivo multipart demasiado grande: {}", ex.getMessage());
        return Map.of("error", "El archivo supera el tamano maximo permitido (10 MB).");
    }

    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    @ExceptionHandler(RateLimitExceededException.class)
    public Map<String, String> manejarRateLimit(RateLimitExceededException ex) {
        log.warn("Rate limit excedido: {}", ex.getMessage());
        return Map.of("error", ex.getMessage());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(BusinessException.class)
    public Map<String, String> manejarNegocio(BusinessException ex) {
        log.warn("Error de negocio: {}", ex.getMessage());
        return Map.of("error", ex.getMessage());
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(ResourceNotFoundException.class)
    public Map<String, String> manejarNoEncontrado(ResourceNotFoundException ex) {
        log.warn("Recurso no encontrado: {}", ex.getMessage());
        return Map.of("error", ex.getMessage());
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NoResourceFoundException.class)
    public Map<String, String> manejarRutaNoEncontrada(NoResourceFoundException ex) {
        log.debug("Ruta no encontrada: {}", ex.getMessage());
        return Map.of("error", "El recurso solicitado no existe.");
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public Map<String, String> manejarGeneral(Exception ex) {
        log.error("Error inesperado: {}", ex.getMessage(), ex);
        if (includeErrorDetails) {
            return Map.of("error", "Error interno del servidor: " + ex.getMessage());
        }
        return Map.of("error", "Error interno del servidor.");
    }
}
