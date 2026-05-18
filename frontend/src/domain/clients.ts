/** Cliente de negocio (catálogo, no cliente final de orden en sí). Coincide con `ClientResponse` del backend. */
export type Client = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  /** Nombres y apellidos del director (libro IIEE regional). */
  nombreApellidosDirectorIiee: string;
  /** Columna CODIGO del Excel regional IIEE (cualquier provincia/DRE). */
  codigoRegional: string;
  departamento: string;
  provincia: string;
  distrito: string;
  ugel: string;
  centroPoblado: string;
  direccion: string;
  /** WGS84 si se guardó desde el mapa. */
  latitud?: number | null;
  longitud?: number | null;
  /** Columna IIEE / código modular. */
  codigoModularIiee: string;
  /** Columna NIVEL del Excel. */
  nivelEducacion: string;
  activo: boolean;
  ordenesTotalesRelacionadas: number;
};

export type ClientWriteBody = {
  /** Si se omite o va vacío, el backend arma el nombre como en la importación regional (centro · IIEE · … · nivel). */
  nombre?: string | null;
  email?: string | null;
  telefono?: string | null;
  nombreApellidosDirectorIiee?: string | null;
  codigoRegional?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  ugel?: string | null;
  centroPoblado?: string | null;
  direccion?: string | null;
  codigoModularIiee?: string | null;
  nivelEducacion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  /** Solo en PUT: borra coordenadas guardadas. */
  ubicacionMapaLimpiar?: boolean;
  activo?: boolean | null;
};

/** Una fila errónea devuelta por el servidor (índice dentro del lote enviado). */
export type ClientBulkImportFailure = {
  indexInBatch: number;
  nombreIntento: string;
  motivo: string;
};

export type ClientBulkImportResult = {
  creados: Client[];
  fallos: ClientBulkImportFailure[];
};

/** Rellena cadenas regionales cuando el backend o cachés antiguas omiten claves. */
export function clienteDesdeServidor(raw: Partial<Client> & Pick<Client, "id" | "nombre">): Client {
  return {
    id: raw.id,
    nombre: raw.nombre ?? "",
    email: raw.email ?? "",
    telefono: raw.telefono ?? "",
    nombreApellidosDirectorIiee: raw.nombreApellidosDirectorIiee ?? "",
    codigoRegional: raw.codigoRegional ?? (raw as { codigoArequipa?: string }).codigoArequipa ?? "",
    departamento: raw.departamento ?? "",
    provincia: raw.provincia ?? "",
    distrito: raw.distrito ?? "",
    ugel: raw.ugel ?? "",
    centroPoblado: raw.centroPoblado ?? "",
    direccion: raw.direccion ?? "",
    latitud: raw.latitud ?? null,
    longitud: raw.longitud ?? null,
    codigoModularIiee: raw.codigoModularIiee ?? "",
    nivelEducacion: raw.nivelEducacion ?? "",
    activo: Boolean(raw.activo),
    ordenesTotalesRelacionadas: raw.ordenesTotalesRelacionadas ?? 0,
  };
}

/** Formato habitual tras import regional IIEE: `{institución} · {nivel}` (véase `clientsExcel.ts`). */
const SEP_DATOS_IMPORT = " · ";

export function simplificarNombreCliente(nombre: string): string {
  const t = nombre.trim();
  if (!t) return "";
  const partes = t.split(" · ");
  const filtradas = partes.filter((p) => {
    const u = p.toUpperCase().trim();
    if (u.includes("UGEL")) return false;
    if (u.startsWith("CÓD.") || u.startsWith("COD.")) return false;
    if (pareceEtiquetaNivel(u)) return false;
    return true;
  });
  if (filtradas.length === 0) return t;
  return filtradas.join(" · ");
}

/**
 * Divide el nombre guardado cuando el sufijo después del último separador tiene pinta de nivel educativo corto.
 */
export function nombreInstitucionYNivelCliente(nombre: string): {
  nombreInstitucion: string;
  nivelEducacion: string | undefined;
  nombreBd: string;
} {
  const nombreBd = nombre.trim();
  if (!nombreBd) {
    return { nombreInstitucion: "", nivelEducacion: undefined, nombreBd };
  }
  const i = nombreBd.lastIndexOf(SEP_DATOS_IMPORT);
  if (i <= 0) {
    return {
      nombreInstitucion: simplificarNombreCliente(nombreBd),
      nivelEducacion: undefined,
      nombreBd,
    };
  }
  const posibleNivel = nombreBd.slice(i + SEP_DATOS_IMPORT.length).trim();
  const base = nombreBd.slice(0, i).trim();
  if (!base || !posibleNivel) {
    return {
      nombreInstitucion: simplificarNombreCliente(nombreBd),
      nivelEducacion: undefined,
      nombreBd,
    };
  }
  /** Evita partir nombres con “cosa · otra cosa” larguísimas; los niveles suelen ser 1–3 palabras. */
  if (posibleNivel.length > 40 || posibleNivel.split(/\s+/).filter(Boolean).length > 5) {
    return {
      nombreInstitucion: simplificarNombreCliente(nombreBd),
      nivelEducacion: undefined,
      nombreBd,
    };
  }
  if (!pareceEtiquetaNivel(posibleNivel)) {
    return {
      nombreInstitucion: simplificarNombreCliente(nombreBd),
      nivelEducacion: undefined,
      nombreBd,
    };
  }
  return {
    nombreInstitucion: simplificarNombreCliente(base),
    nivelEducacion: posibleNivel,
    nombreBd,
  };
}

function pareceEtiquetaNivel(s: string): boolean {
  const u = s.toUpperCase().replace(/\s+/g, " ").trim();
  if (!u.length) return false;
  /** Vocablos habituales de nivel/modalidad en Excels IIEE regionales por provincia (misma plantilla de columnas). */
  const pistas =
    /\b(PRIMARIA|SECUNDARIA|INICIAL|CEBA|PRONOEI|PRONOI|BEB|TÉCNICO|TECNICO|BÁSICA|BASICA|MULTIGRADO|EIB|JORNAL|ESPECIAL|ALTERNATIVA|SERVICIOS|COMUNITARIOS)\b/;
  return pistas.test(u);
}

export function ubicacionDepartamentalCliente(
  c: Pick<Client, "departamento" | "provincia" | "distrito">,
): string {
  return [c.departamento, c.provincia, c.distrito]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join(" · ");
}

/** Nivel persistido en BD; si falta se intenta inferir desde el sufijo del nombre (registros antiguos). */
export function nivelPreferidoCliente(c: Pick<Client, "nivelEducacion" | "nombre">): string {
  const persisted = (c.nivelEducacion ?? "").trim();
  if (persisted.length > 0) return persisted;
  return nombreInstitucionYNivelCliente(c.nombre).nivelEducacion ?? "";
}

const MAX_NOMBRE_CATALOGO = 200;

function clipNombreCatalogo(s: string): string {
  const t = s.trim();
  if (t.length <= MAX_NOMBRE_CATALOGO) return t;
  return t.slice(0, MAX_NOMBRE_CATALOGO);
}

/**
 * Misma regla que la importación regional en `clientsExcel`: columna NOMBRE (institución) si viene;
 * si no, `centro · IIEE {cod} · UGEL · Cód. {regional}`; al final se añade ` · NIVEL` en mayúsculas si hay nivel.
 */
export function nombreCatalogoIiieeRegionalDesdeCampos(p: {
  nombreInstitucion?: string | null;
  centroPoblado?: string | null;
  codigoModularIiee?: string | null;
  ugel?: string | null;
  codigoRegional?: string | null;
  nivelEducacion?: string | null;
}): string {
  const nombreInst = (p.nombreInstitucion ?? "").trim();
  const centro = (p.centroPoblado ?? "").trim();
  const iieeCod = (p.codigoModularIiee ?? "").trim();
  const ugel = (p.ugel ?? "").trim();
  const codigoRow = (p.codigoRegional ?? "").trim();
  const nivelRaw = (p.nivelEducacion ?? "").trim();

  let nombreSinNivel = nombreInst;
  if (!nombreSinNivel) {
    const partes: string[] = [];
    if (centro) partes.push(centro);
    if (iieeCod) partes.push(`IIEE ${iieeCod}`);
    if (ugel) partes.push(ugel);
    if (codigoRow) partes.push(`Cód. ${codigoRow}`);
    nombreSinNivel = partes.join(SEP_DATOS_IMPORT);
  }
  if (!nombreSinNivel.trim()) return "";

  const nivelMostrar = nivelRaw ? nivelRaw.toUpperCase().replace(/\s+/g, " ").trim() : "";
  if (nivelMostrar) {
    return clipNombreCatalogo(`${nombreSinNivel}${SEP_DATOS_IMPORT}${nivelMostrar}`);
  }
  return clipNombreCatalogo(nombreSinNivel);
}
