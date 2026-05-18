package com.promssac.backend.config;

import com.promssac.backend.model.entity.RolWeb;
import com.promssac.backend.model.entity.UsuarioWeb;
import com.promssac.backend.model.enums.ModoPermisoUsuarioWeb;
import com.promssac.backend.repository.RolWebRepository;
import com.promssac.backend.repository.UsuarioWebRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(100)
@RequiredArgsConstructor
@Slf4j
public class RolWebDataSeeder implements ApplicationRunner {

    private static final String ALL_PERMS = "{" +
            "\"g1\":true,\"g2\":true,\"g2-1\":true,\"g2-2\":true," +
            "\"g2-3\":true,\"g2-4\":true,\"g3\":true,\"g4\":true," +
            "\"g6\":true,\"a1\":true,\"a2\":true," +
            "\"a2-1\":true,\"a2-2\":true,\"a3\":true,\"a4\":true" +
            "}";

    private final RolWebRepository rolWebRepository;
    private final UsuarioWebRepository usuarioWebRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedRolesIfEmpty();
        ensureAdminRoleWithPermissions();
        seedAdminUserIfMissing();
    }

    private void seedRolesIfEmpty() {
        if (rolWebRepository.count() > 0) {
            return;
        }
        seedRol("admin", "Administrador", "Acceso de administración.", ALL_PERMS);
        seedRol("supervisor", "Supervisor", "Supervisión operativa.",
                "{\"g1\":true,\"g2\":true,\"g3\":true,\"g4\":true,\"g6\":true}");
        seedRol("operador", "Operador", "Operaciones del día a día.",
                "{\"g1\":true,\"g2\":true}");
        log.info("Roles web por defecto creados (tabla vacía).");
    }

    private void ensureAdminRoleWithPermissions() {
        rolWebRepository.findByClaveIgnoreCase("admin").ifPresentOrElse(
                rol -> {
                    rol.setPermisosJson(ALL_PERMS);
                    rol.setActivo(true);
                    rol.setNombre("Administrador");
                    rolWebRepository.save(rol);
                    log.info("Rol admin verificado: permisos completos asegurados.");
                },
                () -> {
                    seedRol("admin", "Administrador", "Acceso de administración.", ALL_PERMS);
                    log.info("Rol admin creado (faltaba).");
                });
    }

    private RolWeb seedRol(String clave, String nombre, String descripcion, String permisosJson) {
        RolWeb r = new RolWeb();
        r.setClave(clave);
        r.setNombre(nombre);
        r.setDescripcion(descripcion);
        r.setActivo(true);
        r.setPermisosJson(permisosJson);
        return rolWebRepository.save(r);
    }

    private void seedAdminUserIfMissing() {
        if (usuarioWebRepository.existsByNombreUsuarioIgnoreCase("admin")) {
            return;
        }

        RolWeb adminRol = rolWebRepository.findByClaveIgnoreCase("admin")
                .orElseThrow(() -> new IllegalStateException("Rol admin no encontrado al intentar crear usuario admin"));

        UsuarioWeb u = new UsuarioWeb();
        u.setNombreCompleto("Administrador");
        u.setNombreUsuario("admin");
        u.setEmail("admin@promssac.com");
        u.setContrasenaHash(passwordEncoder.encode("admin123"));
        u.setActivo(true);
        u.setModoPermisos(ModoPermisoUsuarioWeb.ROL);
        u.setRolClave(adminRol.getClave());
        u.setPermisosJson("{}");
        usuarioWebRepository.save(u);
        log.info("Usuario admin por defecto creado.");
    }
}
