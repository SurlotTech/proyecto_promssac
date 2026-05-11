package com.promssac.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(length = 120)
    private String email;

    @Column(length = 40)
    private String telefono;

    /** Columna regional: nombres y apellidos del director de la IIEE. */
    @Column(name = "nombre_apellidos_director_iiee", length = 200)
    private String nombreApellidosDirectorIiee;

    /** Columna CODIGO del libro IIEE regional; columna física {@code codigo_regional}. */
    @Column(name = "codigo_regional", length = 48)
    private String codigoRegional;

    @Column(length = 120)
    private String departamento;

    @Column(length = 120)
    private String provincia;

    @Column(length = 120)
    private String distrito;

    @Column(length = 220)
    private String ugel;

    @Column(name = "centro_poblado", length = 200)
    private String centroPoblado;

    @Column(length = 300)
    private String direccion;

    @Column(name = "latitud", precision = 11, scale = 8)
    private BigDecimal latitud;

    @Column(name = "longitud", precision = 11, scale = 8)
    private BigDecimal longitud;

    /** Valor de la columna IIEE (código modular u homólogo). */
    @Column(name = "codigo_modular_iiee", length = 48)
    private String codigoModularIiee;

    /** Columna NIVEL (texto tal como viene del Excel). */
    @Column(name = "nivel_educacion", length = 80)
    private String nivelEducacion;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "creado_en", nullable = false)
    private Instant creadoEn = Instant.now();

    @Column(name = "actualizado_en", nullable = false)
    private Instant actualizadoEn = Instant.now();
}
