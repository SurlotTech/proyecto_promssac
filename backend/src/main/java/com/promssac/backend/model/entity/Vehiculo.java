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

    /** Placa del vehículo. Ej: BFS-748 */
    @Column(nullable = false, unique = true, length = 20)
    private String placa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoVehiculo tipo;

    /** Grupo operativo al que pertenece. Ej: Lima Norte */
    @Column(nullable = false, length = 60)
    private String grupo;

    /** Nombre del conductor asignado. Null si no tiene conductor. */
    @Column(length = 120)
    private String conductor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoVehiculo estado;

    /** Capacidad máxima de carga en kilogramos. */
    @Column(nullable = false)
    private Integer capacidadKg;

    /** Porcentaje de carga actual (0-100). */
    @Column(nullable = false)
    private Integer porcentajeCarga;

    /** Fecha del último servicio de mantenimiento. */
    @Column
    private LocalDate ultimoServicio;

    /** Si es true, el sistema puede asignarle órdenes automáticamente. */
    @Column(nullable = false)
    private Boolean autoGestion;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
