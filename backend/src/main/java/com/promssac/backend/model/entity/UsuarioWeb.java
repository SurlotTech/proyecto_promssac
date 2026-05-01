package com.promssac.backend.model.entity;

import com.promssac.backend.model.enums.ModoPermisoUsuarioWeb;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "usuarios_web")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "contrasenaHash")
public class UsuarioWeb {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nombre_completo", nullable = false, length = 200)
    private String nombreCompleto;

    @Column(name = "nombre_usuario", nullable = false, unique = true, length = 120)
    private String nombreUsuario;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(name = "contrasena_hash", nullable = false, length = 100)
    private String contrasenaHash;

    @Column(nullable = false)
    private Boolean activo = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "modo_permisos", nullable = false, length = 24)
    private ModoPermisoUsuarioWeb modoPermisos;

    @Column(name = "rol_clave", length = 40)
    private String rolClave;

    @Column(name = "permisos_json", nullable = false, columnDefinition = "TEXT")
    private String permisosJson;

    @Column(name = "ultima_conexion")
    private LocalDateTime ultimaConexion;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
