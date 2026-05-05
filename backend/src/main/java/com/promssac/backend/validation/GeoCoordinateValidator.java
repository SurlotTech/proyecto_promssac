package com.promssac.backend.validation;

import com.promssac.backend.exception.BusinessException;
import java.math.BigDecimal;

/** Rangos WGS84 habituales para latitud / longitud. */
public final class GeoCoordinateValidator {

    private static final BigDecimal LAT_MIN = BigDecimal.valueOf(-90);
    private static final BigDecimal LAT_MAX = BigDecimal.valueOf(90);
    private static final BigDecimal LON_MIN = BigDecimal.valueOf(-180);
    private static final BigDecimal LON_MAX = BigDecimal.valueOf(180);

    private GeoCoordinateValidator() {}

    public static void assertLatLon(BigDecimal latitud, BigDecimal longitud) {
        if (latitud != null
                && (latitud.compareTo(LAT_MIN) < 0 || latitud.compareTo(LAT_MAX) > 0)) {
            throw new BusinessException("Latitud fuera de rango.");
        }
        if (longitud != null
                && (longitud.compareTo(LON_MIN) < 0 || longitud.compareTo(LON_MAX) > 0)) {
            throw new BusinessException("Longitud fuera de rango.");
        }
    }
}
