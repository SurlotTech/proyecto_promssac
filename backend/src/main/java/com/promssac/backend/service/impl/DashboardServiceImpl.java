package com.promssac.backend.service.impl;

import com.promssac.backend.model.dto.response.DashboardResponse;
import com.promssac.backend.repository.DashboardRepository;
import com.promssac.backend.service.DashboardService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private final DashboardRepository repo;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse obtenerDashboard() {
        LocalDate hoy = LocalDate.now();
        Instant inicioHoy = hoy.atStartOfDay(LIMA).toInstant();

        int entregasHoy = (int) repo.contarEntregasDesde(inicioHoy);
        int rutasActivas = (int) repo.contarRutasPorFecha(hoy);
        int flotaTotal = (int) repo.contarVehiculos();
        long recaudacionHoy = repo.sumarRecaudacionDesde(inicioHoy);

        return DashboardResponse.builder()
                .entregasHoy(entregasHoy)
                .rutasActivas(rutasActivas)
                .flotaDisponible(flotaTotal)
                .flotaTotal(flotaTotal)
                .recaudacionHoy(recaudacionHoy)
                .performanceMensual(obtenerPerformance(hoy))
                .flotaStatus(obtenerFlotaStatus(flotaTotal, rutasActivas))
                .topConductores(obtenerTopConductores(hoy))
                .build();
    }

    private List<DashboardResponse.MesPerformance> obtenerPerformance(LocalDate hoy) {
        String[] meses = {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};

        Instant inicioAnio = LocalDate.of(hoy.getYear(), 1, 1).atStartOfDay(LIMA).toInstant();
        Instant inicioProxAnio = LocalDate.of(hoy.getYear() + 1, 1, 1).atStartOfDay(LIMA).toInstant();

        List<Object[]> rows = repo.performanceMensualEntre(inicioAnio, inicioProxAnio);

        int[] entregasMes = new int[12];
        int[] pendientesMes = new int[12];

        for (Object[] row : rows) {
            int mes = ((Number) row[0]).intValue() - 1;
            int entregas = ((Number) row[1]).intValue();
            int pendientes = ((Number) row[2]).intValue();
            if (mes >= 0 && mes < 12) {
                entregasMes[mes] = entregas;
                pendientesMes[mes] = pendientes;
            }
        }

        List<DashboardResponse.MesPerformance> result = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            result.add(DashboardResponse.MesPerformance.builder()
                    .mes(meses[i])
                    .entregas(entregasMes[i])
                    .pendientes(pendientesMes[i])
                    .build());
        }
        return result;
    }

    private List<DashboardResponse.FlotaStatus> obtenerFlotaStatus(int flotaTotal, int rutasActivas) {
        return List.of(
                DashboardResponse.FlotaStatus.builder()
                        .name("Disponibles").value(flotaTotal).color("oklch(0.68 0.16 155)").build(),
                DashboardResponse.FlotaStatus.builder()
                        .name("En ruta").value(rutasActivas).color("oklch(0.65 0.16 240)").build(),
                DashboardResponse.FlotaStatus.builder()
                        .name("Mantenimiento").value(0).color("oklch(0.78 0.15 75)").build(),
                DashboardResponse.FlotaStatus.builder()
                        .name("Inactivos").value(0).color("oklch(0.7 0.02 260)").build()
        );
    }

    private List<DashboardResponse.ConductorRanking> obtenerTopConductores(LocalDate hoy) {
        LocalDate inicio = hoy.minusMonths(1);
        Instant ini = inicio.atStartOfDay(LIMA).toInstant();
        Instant end = hoy.atStartOfDay(LIMA).toInstant();

        List<Object[]> rows = repo.topConductoresEntre(ini, end);
        return rows.stream().map(row -> DashboardResponse.ConductorRanking.builder()
                .name((String) row[0])
                .entregas(((Number) row[1]).intValue())
                .build()).toList();
    }
}
