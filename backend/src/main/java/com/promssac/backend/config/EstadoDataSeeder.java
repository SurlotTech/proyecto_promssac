package com.promssac.backend.config;

import com.promssac.backend.model.entity.Estado;
import com.promssac.backend.repository.EstadoRepository;
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
public class EstadoDataSeeder implements ApplicationRunner {

    private final EstadoRepository repository;

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) return;

        Estado entregado = crearPadre("Entregado");
        Estado noEntregado = crearPadre("No entregado");
        Estado inRoute = crearPadre("En ruta");
        Estado pending = crearPadre("Pendiente");

        crearHijo("Recepcionado conforme", entregado);
        crearHijo("Entrega tercero", entregado);
        crearHijo("Entrega UGEL", entregado);
        crearHijo("Devolución", noEntregado);
        crearHijo("En ruta", inRoute);
        crearHijo("Pendiente", pending);

        log.info("Estados y subestados por defecto creados.");
    }

    private Estado crearPadre(String nombre) {
        Estado e = new Estado();
        e.setNombre(nombre);
        return repository.save(e);
    }

    private void crearHijo(String nombre, Estado parent) {
        Estado e = new Estado();
        e.setNombre(nombre);
        e.setParent(parent);
        repository.save(e);
    }
}
