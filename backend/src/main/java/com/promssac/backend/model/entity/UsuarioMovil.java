package com.promssac.backend.model.entity;

import com.promssac.backend.model.enums.ModoVehiculoUsuarioMovil;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "usuarios_movil")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class UsuarioMovil {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nombre_completo", nullable = false, length = 200)
    private String nombreCompleto;

    @Column(name = "nombre_usuario", nullable = false, unique = true, length = 80)
    private String nombreUsuario;

    @Column(name = "contrasena_hash", nullable = false, length = 100)
    private String contrasenaHash;

    @Column(length = 40)
    private String telefono;

    @Column(name = "foto_aprobada", nullable = false)
    private Boolean fotoAprobada;

    /** Content-Type de la imagen almacenada; null si no hay archivo. */
    @Column(name = "foto_content_type", length = 80)
    private String fotoContentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "modo_vehiculo", nullable = false, length = 16)
    private ModoVehiculoUsuarioMovil modoVehiculo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @Column(name = "permisos_json", nullable = false, length = 4000)
    private String permisosJson;

    @Column(name = "activo", nullable = false)
    @ColumnDefault("true")
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
