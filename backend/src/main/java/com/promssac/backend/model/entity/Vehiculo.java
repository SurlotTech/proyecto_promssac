package com.promssac.backend.model.entity;

import com.promssac.backend.model.enums.EstadoVehiculo;
import com.promssac.backend.model.enums.TipoVehiculo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
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
@Table(name = "vehiculos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Vehiculo {

    @EqualsAndHashCode.Include
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String placa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoVehiculo tipo;

    @Column(nullable = false, length = 60)
    private String grupo;

    @Column(length = 120)
    private String conductor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoVehiculo estado;

    @Column(nullable = false)
    private Integer capacidadKg;

    @Column(nullable = false)
    private Integer porcentajeCarga;

    @Column
    private LocalDate ultimoServicio;

    @Column(nullable = false)
    private Boolean autoGestion;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
