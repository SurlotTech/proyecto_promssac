package com.promssac.backend.service;

import com.promssac.backend.model.dto.response.FleetDeviceResponse;
import java.util.List;

public interface FlotaService {

    List<FleetDeviceResponse> listarDispositivos();

    List<FleetDeviceResponse> listarDispositivosOnWayMapa();
}
