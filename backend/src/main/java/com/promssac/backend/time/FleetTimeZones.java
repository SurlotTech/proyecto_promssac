package com.promssac.backend.time;

import java.time.ZoneId;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/** Zona horaria única para flota / operaciones Perú. */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class FleetTimeZones {

    public static final ZoneId AMERICA_LIMA = ZoneId.of("America/Lima");
}
