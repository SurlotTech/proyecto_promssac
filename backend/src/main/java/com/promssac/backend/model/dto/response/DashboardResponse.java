package com.promssac.backend.model.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardResponse {

    private int entregasHoy;
    private int rutasActivas;
    private int flotaDisponible;
    private int flotaTotal;
    private double recaudacionHoy;

    private List<MesPerformance> performanceMensual;

    @Getter
    @Builder
    public static class MesPerformance {
        private String mes;
        private int entregas;
        private int pendientes;
    }

    private List<FlotaStatus> flotaStatus;

    @Getter
    @Builder
    public static class FlotaStatus {
        private String name;
        private int value;
        private String color;
    }

    private List<ConductorRanking> topConductores;
    private List<ActividadReciente> actividadReciente;

    @Getter
    @Builder
    public static class ConductorRanking {
        private String name;
        private int entregas;
    }

    @Getter
    @Builder
    public static class ActividadReciente {
        private String tipo;
        private String titulo;
        private String detalle;
        private String fechaIso;
    }
}
