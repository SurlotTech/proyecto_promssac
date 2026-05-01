package com.promssac.backend.exception;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> manejarValidacion(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .findFirst()
                .orElse("Petición inválida");
        log.warn("Validación fallida: {}", msg);
        return Map.of("error", msg);
    }

    @ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public Map<String, String> manejarTamanoMultipart(MaxUploadSizeExceededException ex) {
        log.warn("Archivo multipart demasiado grande: {}", ex.getMessage());
        return Map.of("error", "El archivo supera el tamaño máximo permitido (10 MB).");
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

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public Map<String, String> manejarGeneral(Exception ex) {
        log.error("Error inesperado: {}", ex.getMessage(), ex);
        return Map.of("error", "Error interno del servidor.");
    }
}
