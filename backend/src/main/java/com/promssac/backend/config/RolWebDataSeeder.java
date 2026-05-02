package com.promssac.backend.config;

import com.promssac.backend.model.entity.RolWeb;
import com.promssac.backend.repository.RolWebRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(100)
@RequiredArgsConstructor
@Slf4j
public class RolWebDataSeeder implements ApplicationRunner {

    private final RolWebRepository rolWebRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (rolWebRepository.count() > 0) {
            return;
        }
        seed("admin", "Administrador", "Acceso de administración.");
        seed("supervisor", "Supervisor", "Supervisión operativa.");
        seed("operador", "Operador", "Operaciones del día a día.");
        log.info("Roles web por defecto creados (tabla vacía).");
    }

    private void seed(String clave, String nombre, String descripcion) {
        RolWeb r = new RolWeb();
        r.setClave(clave);
        r.setNombre(nombre);
        r.setDescripcion(descripcion);
        r.setActivo(true);
        r.setPermisosJson("{}");
        rolWebRepository.save(r);
    }
}
