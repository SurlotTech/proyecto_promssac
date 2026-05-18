package com.promssac.backend.config;

import com.promssac.backend.model.entity.Subestado;
import com.promssac.backend.repository.SubestadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(101)
@RequiredArgsConstructor
@Slf4j
public class SubestadoDataSeeder implements ApplicationRunner {

    private final SubestadoRepository repository;

    private static final String[][] DEFAULTS = {
            {"Recepcionado conforme", "entregado"},
            {"Entrega tercero", "entregado"},
            {"Entrega UGEL", "entregado"},
            {"Devolución", "no_entregado"},
            {"En ruta", "in_route"},
            {"Pendiente", "pending"},
    };

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) return;
        for (String[] row : DEFAULTS) {
            Subestado s = new Subestado();
            s.setNombre(row[0]);
            s.setEstadoPadre(row[1]);
            repository.save(s);
        }
        log.info("Subestados por defecto creados.");
    }
}
