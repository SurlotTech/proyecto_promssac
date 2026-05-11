#!/usr/bin/env node
/**
 * Actualiza `direccion` (y opcionalmente lat/long) de cada cliente usando la misma
 * geocodificación que la app: búsqueda Nominatim en Perú vía backend.
 *
 * Consulta por cliente: "Institución Educativa No. " + valor de columna IIEE (`codigoModularIiee`).
 * Ejemplo: "Institución Educativa No. 41059" → dirección tipo la que devuelve Nominatim.
 *
 * Requisitos: backend en marcha (por defecto http://localhost:8080).
 *
 * Uso:
 *   node backend/scripts/actualizar-direcciones-clientes-iiee.mjs
 *   PROMSSAC_API_BASE=http://127.0.0.1:8080 node backend/scripts/actualizar-direcciones-clientes-iiee.mjs
 *   node backend/scripts/actualizar-direcciones-clientes-iiee.mjs --dry-run
 *   node backend/scripts/actualizar-direcciones-clientes-iiee.mjs --solo-activos
 *
 * Variables:
 *   PROMSSAC_API_BASE   URL base (default http://localhost:8080)
 *   NOMINATIM_DELAY_MS  Pausa entre búsquedas en ms (default 1100, recomendado ≥1000 por uso de Nominatim)
 */

const BASE = (process.env.PROMSSAC_API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
const DELAY_MS = Number(process.env.NOMINATIM_DELAY_MS ?? 1100);
const PREFIX = "Institución Educativa No. ";

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const SOLO_ACTIVOS = args.has("--solo-activos");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toWriteBody(c, { direccion, latitud, longitud }) {
  return {
    nombre: c.nombre,
    email: c.email?.trim() ? c.email.trim() : null,
    telefono: c.telefono?.trim() ? c.telefono.trim() : null,
    nombreApellidosDirectorIiee: c.nombreApellidosDirectorIiee?.trim()
      ? c.nombreApellidosDirectorIiee.trim()
      : null,
    codigoRegional: c.codigoRegional?.trim() ? c.codigoRegional.trim() : null,
    departamento: c.departamento?.trim() ? c.departamento.trim() : null,
    provincia: c.provincia?.trim() ? c.provincia.trim() : null,
    distrito: c.distrito?.trim() ? c.distrito.trim() : null,
    ugel: c.ugel?.trim() ? c.ugel.trim() : null,
    centroPoblado: c.centroPoblado?.trim() ? c.centroPoblado.trim() : null,
    direccion: direccion.length > 300 ? direccion.slice(0, 300) : direccion,
    codigoModularIiee: c.codigoModularIiee?.trim() ? c.codigoModularIiee.trim() : null,
    nivelEducacion: c.nivelEducacion?.trim() ? c.nivelEducacion.trim() : null,
    latitud,
    longitud,
    activo: Boolean(c.activo),
  };
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" && data != null && (data.error || data.message)
        ? data.error || data.message
        : text;
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return data;
}

async function main() {
  const listUrl = `${BASE}/api/v1/clientes?incluirInactivos=${SOLO_ACTIVOS ? "false" : "true"}`;
  console.log(`Listando clientes: ${listUrl}`);
  const clientes = await fetchJson(listUrl);
  if (!Array.isArray(clientes)) {
    console.error("Respuesta inesperada (no es un array).");
    process.exit(1);
  }

  let ok = 0;
  let skip = 0;
  let err = 0;

  for (const c of clientes) {
    const iiee = (c.codigoModularIiee ?? "").trim();
    if (!iiee) {
      skip++;
      console.log(`[omitir] ${c.id} — sin código modular IIEE`);
      continue;
    }

    const q = `${PREFIX}${iiee}`;
    let geo;
    try {
      await sleep(DELAY_MS);
      const geoUrl = `${BASE}/api/v1/geocodificacion/buscar?${new URLSearchParams({ q })}`;
      geo = await fetchJson(geoUrl);
    } catch (e) {
      err++;
      console.error(`[error buscar] ${c.id} IIEE=${iiee} — ${e.message}`);
      continue;
    }

    const display = (geo.displayName ?? "").trim();
    if (!display) {
      err++;
      console.error(`[error vacío] ${c.id} IIEE=${iiee}`);
      continue;
    }

    const direccion = display.slice(0, 300);
    const latitud = typeof geo.lat === "number" ? geo.lat : Number(geo.lat);
    const longitud = typeof geo.lon === "number" ? geo.lon : Number(geo.lon);
    if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
      err++;
      console.error(`[error coords] ${c.id} IIEE=${iiee}`);
      continue;
    }

    if (DRY) {
      console.log(`[dry-run] ${c.id} IIEE=${iiee}`);
      console.log(`          → ${direccion}`);
      ok++;
      continue;
    }

    const body = toWriteBody(c, { direccion, latitud, longitud });
    try {
      await fetchJson(`${BASE}/api/v1/clientes/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      ok++;
      console.log(`[ok] ${c.id} IIEE=${iiee}`);
      console.log(`     → ${direccion}`);
    } catch (e) {
      err++;
      console.error(`[error put] ${c.id} — ${e.message}`);
    }
  }

  console.log(`\nResumen: ok=${ok} omitidos_sin_iiee=${skip} errores=${err} dry-run=${DRY}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
