package com.promssac.backend.validation;

import com.promssac.backend.exception.BusinessException;
import java.util.regex.Pattern;
import org.springframework.util.StringUtils;

/** Correo opcional: vacío o null es válido; si hay texto debe cumplir formato básico. */
public final class CorreoOpcionalValidator {

    private static final Pattern CORREO_BASICO =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");

    private CorreoOpcionalValidator() {}

    public static void assertValidoSiPresente(String email) {
        if (!StringUtils.hasText(email)) {
            return;
        }
        String t = email.trim();
        if (!CORREO_BASICO.matcher(t).matches()) {
            throw new BusinessException("Correo electrónico no válido.");
        }
    }
}
