package com.promssac.backend.service;

import com.promssac.backend.model.dto.response.OrderResponse;
import java.util.List;

public interface OrdenService {

    List<OrderResponse> listarParaOperaciones();
}
