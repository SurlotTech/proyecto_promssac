package com.promssac.backend.service;

import com.promssac.backend.model.dto.response.GeocodificacionDto;

public interface NominatimGeocodificacionService {

    GeocodificacionDto reversa(double lat, double lon);

    GeocodificacionDto buscar(String consulta);
}
