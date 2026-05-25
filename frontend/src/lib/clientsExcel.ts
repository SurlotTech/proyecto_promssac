import {
  type Client,
  type ClientWriteBody,
  nombreCatalogoIiieeRegionalDesdeCampos,
  nombreInstitucionYNivelCliente,
} from "@/domain/clients";
import * as XLSX from "xlsx-js-style";

export const CLIENTES_EXPORT_HEADERS = [
  "ID",
  "CODIGO REGIONAL",
  "DEPARTAMENTO",
  "PROVINCIA",
  "DISTRITO",
  "UGEL",
  "CENTRO POBLADO",
  "DIRECCIÓN",
  "CÓDIGO MODULAR IIEE",
  "NIVEL (BD)",
  "INSTITUCIÓN (derivada)",
  "NOMBRE EN CATÁLOGO",
  "NOMBRES DIRECTOR IIEE",
  "EMAIL",
  "TELÉFONO",
  "ACTIVO",
  "ÓRDENES RELACIONADAS",
] as const;

/**
 * Columnas estándar del libro IIEE por región/provincia (misma estructura en todo el país).
 */
export const CLIENTES_PLANTILLA_IIEE_REGIONAL_HEADERS = [
  "CODIGO",
  "DEPARTAMENTO",
  "Primaria_PROVINCIA",
  "DISTRITO",
  "UGEL",
  "Centro poblado",
  "Dirección",
  "IIEE",
  "NOMBRE",
  "NIVEL",
  "NOMBRES Y APELLIDOS\r\n(DIRECTOR DE LA IIEE)",
  "EMAIL\r\n(DIRECTOR DE LA IIEE)",
  "TELÉFONO 1\r\n(DIRECTOR DE LA IIEE)",
] as const;

/** Plantilla corta: primera fila NOMBRE, contacto, ACTIVO; sin libro regional IIEE completo. */
export const CLIENTES_PLANTILLA_HEADERS = [
  "NOMBRE",
  "EMAIL",
  "TELÉFONO",
  "ACTIVO",
] as const;

export type ParsedClienteImportRow = {
  nombre: string;
  email: string | undefined;
  telefono: string | undefined;
  activo: boolean;
  /** Índice de fila humana en la hoja (1 = primera fila de datos bajo cabecera). */
  rowIndex: number;
};

/** Fila lista para crear cliente + contexto opcional para vista previa. */
export type ClientImportPreviewRow = ParsedClienteImportRow & {
  importSource: "plantilla" | "regional-iiiee";
  codigoRegional?: string;
  direccion?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  ugel?: string;
  centroPoblado?: string;
  /** Código modular u otra llave IIEE (columna IIEE del Excel). */
  codigoModularIiee?: string;
  /** PRIMARIA / SECUNDARIA / … según Excel (solo import regional IIEE). */
  nivel?: string;
  /** Nombres del director desde columna regional (no confundir con NOMBRE de la institución). */
  nombreApellidosDirectorIiee?: string;
};

const headerStyle = {
  font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "4B5563" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
};

const cellStyle = {
  font: { sz: 12 },
  alignment: { vertical: "center", wrapText: true },
};

function applySheetStyles(ws: XLSX.WorkSheet, colCount: number, rowCount: number) {
  const ref = ws["!ref"];
  if (!ref) return;
  const range = XLSX.utils.decode_range(ref);
  for (let R = range.s.r; R <= Math.min(range.e.r, rowCount - 1); ++R) {
    for (let C = range.s.c; C <= Math.min(range.e.c, colCount - 1); ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = R === 0 ? headerStyle : cellStyle;
    }
  }
  ws["!rows"] = Array(Math.max(rowCount, 50)).fill({ hpt: 24 });
  ws["!cols"] = Array.from({ length: colCount }, () => ({ wch: 24 }));
}

/** Descarga plantilla estándar (hoja «REGIONAL»; compatible con libros legacy «AREQUIPA»). */
export function downloadPlantillaImportacionClientes() {
  const columns = [...CLIENTES_PLANTILLA_IIEE_REGIONAL_HEADERS];
  const sampleData: (string | number)[][] = [
    [
      "040505069985",
      "Mi DRE (ejemplo provincia)",
      "PROVINCIA EJEMPLO",
      "DISTRITO EJEMPLO",
      "UGEL EJEMPLO",
      "JACHAÑA",
      "JACHAÑA",
      40030,
      "SAN FRANCISCO DE ASIS",
      "PRIMARIA",
      "MARÍA LÓPEZ QUISPE",
      "director@iiee.gob.pe",
      "987654321",
    ],
    [
      "040505069985",
      "Mi DRE (ejemplo provincia)",
      "PROVINCIA EJEMPLO",
      "DISTRITO EJEMPLO",
      "UGEL EJEMPLO",
      "JACHAÑA",
      "JACHAÑA",
      40030,
      "SAN FRANCISCO DE ASIS",
      "SECUNDARIA",
      "MARÍA LÓPEZ QUISPE",
      "director@iiee.gob.pe",
      "987654321",
    ],
  ];
  const wsData = [columns, ...sampleData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  applySheetStyles(ws, columns.length, wsData.length);
  ws["!cols"] = columns.map((_, i) => {
    if (i === columns.indexOf("Dirección")) return { wch: 38 };
    if (
      normalizeHeaderCell(columns[i]).includes("email") ||
      normalizeHeaderCell(columns[i]).includes("telefono")
    ) {
      return { wch: 30 };
    }
    if (normalizeHeaderCell(columns[i]).includes("nombres") && normalizeHeaderCell(columns[i]).includes("apellidos")) {
      return { wch: 34 };
    }
    return { wch: 22 };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "REGIONAL");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_importacion_clientes.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

export function exportClientesVistaXlsx(rows: Client[], filename?: string) {
  const cols = [...CLIENTES_EXPORT_HEADERS];
  const wsData = [
    cols.map(String),
    ...rows.map((c) => {
      const v = nombreInstitucionYNivelCliente(c.nombre);
      const nivelCol = ((c.nivelEducacion ?? "").trim() || v.nivelEducacion || "").trim();
      return [
      c.id,
      c.codigoRegional ?? "",
      c.departamento ?? "",
      c.provincia ?? "",
      c.distrito ?? "",
      c.ugel ?? "",
      c.centroPoblado ?? "",
      c.direccion ?? "",
      c.codigoModularIiee ?? "",
      nivelCol,
      v.nombreInstitucion,
      v.nombreBd,
      c.nombreApellidosDirectorIiee ?? "",
      c.email ?? "",
      c.telefono ?? "",
      c.activo ? "SI" : "NO",
      c.ordenesTotalesRelacionadas ?? 0,
    ];
    }),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  applySheetStyles(ws, cols.length, wsData.length);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");
  const stamp = filename ?? `export_clientes_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = stamp;
  a.click();
  URL.revokeObjectURL(url);
}

function normalizeHeaderCell(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function columnIndex(headers: string[], ...aliases: string[]): number {
  const want = aliases.map((a) => normalizeHeaderCell(a));
  for (let i = 0; i < headers.length; i++) {
    const h = normalizeHeaderCell(headers[i]);
    if (!h) continue;
    if (want.some((w) => w === h || h.includes(w))) return i;
    if (
      aliases.some((alias) => {
        const norm = normalizeHeaderCell(alias).replace(/\s+/g, "");
        return norm.length > 0 && h.replace(/\s+/g, "") === norm.replace(/\s+/g, "");
      })
    )
      return i;
  }
  return -1;
}

function columnIndexExact(headers: string[], alias: string): number {
  const want = normalizeHeaderCell(alias).replace(/\s+/g, " ");
  for (let i = 0; i < headers.length; i++) {
    if (normalizeHeaderCell(headers[i]).replace(/\s+/g, " ") === want) return i;
  }
  return -1;
}

/**
 * Columna regional «NOMBRES Y APELLIDOS (DIRECTOR DE LA IIEE)»: no debe coincidir con la columna «NOMBRE» de la institución.
 */
function columnIndexNombresApellidosDirectorIiee(headers: string[]): number {
  for (let c = 0; c < headers.length; c++) {
    const h = normalizeHeaderCell(headers[c]).replace(/\s+/g, " ");
    if (h === "nombre") continue;
    if (
      (h.includes("nombres y apellidos") || h.includes("nombre y apellido") || h.includes("apellidos y nombres")) &&
      (h.includes("director") || h.includes("iiee"))
    )
      return c;
    if (h.includes("nombre completo") && h.includes("director")) return c;
  }
  return columnIndex(headers, "nombres y apellidos director de la iiee");
}

function clipField(s: string, maxLen: number): string {
  const t = s.trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen);
}

function primeraFilaCabecerasSheet(sheet: XLSX.WorkSheet): string[] {
  const matrix = XLSX.utils.sheet_to_json<Array<unknown>>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  }) as unknown[][];
  return (matrix[0] ?? []).map((c) => String(c));
}

function tieneColumnasMinimalRegionalIiiee(headers: string[]): boolean {
  const iUgel = columnIndex(headers, "ugel");
  const iIieeHdr = columnIndex(headers, "iiee");
  let iNombreIiee = -1;
  for (let c = 0; c < headers.length; c++) {
    const h = normalizeHeaderCell(headers[c]).replace(/\s+/g, " ");
    if (h === "nombre") {
      iNombreIiee = c;
      break;
    }
  }
  const iCodigo =
    columnIndexExact(headers, "codigo") >= 0
      ? columnIndexExact(headers, "codigo")
      : columnIndex(headers, "codigo");
  return !(iUgel < 0 && iIieeHdr < 0 && iNombreIiee < 0 && iCodigo < 0);
}

function pareceNombreHojaRegionalIiiee(nombreHoja: string): boolean {
  const t = nombreSheetNormalizadoSinAcentos(nombreHoja);
  return (
    t === "arequipa" ||
    t === "regional" ||
    t === "iiee" ||
    t === "catalogo iiee" ||
    t === "lista iiee"
  );
}

function nombreSheetNormalizadoSinAcentos(n: string): string {
  return String(n ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function buscarNombreHojaRegionalIiiee(wb: XLSX.WorkBook): string | undefined {
  for (const n of wb.SheetNames) {
    if (pareceNombreHojaRegionalIiiee(n)) return n;
  }
  for (const n of wb.SheetNames) {
    const headers = primeraFilaCabecerasSheet(wb.Sheets[n]);
    if (!headers.some((h) => h.trim().length > 0)) continue;
    if (tieneColumnasMinimalRegionalIiiee(headers)) return n;
  }
  return undefined;
}

function parseRegionalIiieeMatrix(matrix: unknown[][]): ClientImportPreviewRow[] {
  if (matrix.length < 2) {
    throw new Error("Esta hoja debe tener encabezados y al menos una fila de datos.");
  }

  const headers = (matrix[0] ?? []).map((c) => String(c));
  const iUgel = columnIndex(headers, "ugel");
  const iIieeHdr = columnIndex(headers, "iiee");

  /** Encabezado exacto “NOMBRE” (institución), no columna del director (“NOMBRES…”). */
  let iNombreIiee = -1;
  for (let c = 0; c < headers.length; c++) {
    const h = normalizeHeaderCell(headers[c]).replace(/\s+/g, " ");
    if (h === "nombre") {
      iNombreIiee = c;
      break;
    }
  }

  const iCodigo =
    columnIndexExact(headers, "codigo") >= 0
      ? columnIndexExact(headers, "codigo")
      : columnIndex(headers, "codigo");
  const iDept = columnIndex(headers, "departamento");
  const iProv = columnIndex(headers, "primaria_provincia", "primaria provincia", "provincia");
  const iDist = columnIndex(headers, "distrito");
  const iCentro = columnIndex(headers, "centro poblado");
  const iDireccion = columnIndex(headers, "direccion", "dirección");
  const iNivel =
    columnIndexExact(headers, "nivel") >= 0 ? columnIndexExact(headers, "nivel") : columnIndex(headers, "nivel educativo");
  const iNombreDirector = columnIndexNombresApellidosDirectorIiee(headers);
  const iEmail = columnIndex(
    headers,
    "email",
    "correo",
    "email director",
    "email (director de la iiee)",
    "email (director",
  );
  const iTel = columnIndex(
    headers,
    "telefono",
    "teléfono",
    "telefono 1",
    "teléfono 1",
    "teléfono 1 director",
    "teléfono 1 director de la",
  );

  if (iUgel < 0 && iIieeHdr < 0 && iNombreIiee < 0 && iCodigo < 0) {
    throw new Error(
      "Faltan columnas reconocibles del libro regional IIEE (UGEL, IIEE, NOMBRE o CÓDIGO). Revísalas o usa la plantilla descargable.",
    );
  }

  const out: ClientImportPreviewRow[] = [];

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const dept = iDept >= 0 ? String(row[iDept] ?? "").trim() : "";
    const prov = iProv >= 0 ? String(row[iProv] ?? "").trim() : "";
    const dist = iDist >= 0 ? String(row[iDist] ?? "").trim() : "";
    const ugel = iUgel >= 0 ? String(row[iUgel] ?? "").trim() : "";
    const centro = iCentro >= 0 ? String(row[iCentro] ?? "").trim() : "";
    const direccionFila = iDireccion >= 0 ? clipField(String(row[iDireccion] ?? "").trim(), 300) : "";
    const iieeCod = iIieeHdr >= 0 ? String(row[iIieeHdr] ?? "").trim() : "";
    const codigoRow = iCodigo >= 0 ? String(row[iCodigo] ?? "").trim() : "";
    const nombreInst = iNombreIiee >= 0 ? String(row[iNombreIiee] ?? "").trim() : "";
    const mail = iEmail >= 0 ? String(row[iEmail] ?? "").trim() : "";
    const telRaw = iTel >= 0 ? String(row[iTel] ?? "").trim() : "";
    const nivelRaw = iNivel >= 0 ? String(row[iNivel] ?? "").trim() : "";
    const nivelMostrar = nivelRaw ? nivelRaw.toUpperCase().replace(/\s+/g, " ").trim() : "";
    const nombreDirectorRaw =
      iNombreDirector >= 0 ? clipField(String(row[iNombreDirector] ?? "").trim(), 200) : "";

    const nombreParaCliente = nombreCatalogoIiieeRegionalDesdeCampos({
      nombreInstitucion: nombreInst || undefined,
      centroPoblado: centro || undefined,
      codigoModularIiee: iieeCod || undefined,
      ugel: ugel || undefined,
      codigoRegional: codigoRow || undefined,
      nivelEducacion: nivelRaw || undefined,
    });
    if (!nombreParaCliente.trim()) continue;

    const base: ParsedClienteImportRow = {
      nombre: nombreParaCliente,
      email: mail ? clipField(mail, 120) : undefined,
      telefono: telRaw ? clipField(telRaw.replace(/\s+/g, ""), 40) : undefined,
      activo: true,
      rowIndex: r,
    };

    out.push({
      ...base,
      importSource: "regional-iiiee",
      codigoRegional: codigoRow || undefined,
      direccion: direccionFila ? direccionFila : undefined,
      departamento: dept || undefined,
      provincia: prov || undefined,
      distrito: dist || undefined,
      ugel: ugel || undefined,
      centroPoblado: centro || undefined,
      codigoModularIiee: iieeCod || undefined,
      nivel: nivelMostrar || undefined,
      nombreApellidosDirectorIiee: nombreDirectorRaw ? nombreDirectorRaw : undefined,
    });
  }

  if (!out.length) {
    throw new Error(
      "No hay filas importables: revisa NOMBRE, IIEE, UGEL o CODIGO, o si las filas quedaron vacías.",
    );
  }
  return out;
}

export function parseRegionalSheetIiieeClients(buffer: ArrayBuffer): ClientImportPreviewRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = buscarNombreHojaRegionalIiiee(wb);
  if (!sheetName) {
    throw new Error(
      'No hay hoja REGIONAL ni otra reconocible. Pon el mismo esquema de columnas IIEE que la plantilla (puedes llamarla REGIONAL o AREQUIPA), o bien una hoja cuyos encabezados incluyan UGEL, IIEE, NOMBRE o CÓDIGO.',
    );
  }
  const sheet = wb.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<Array<unknown>>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  }) as unknown[][];
  return parseRegionalIiieeMatrix(matrix);
}

export function parseClienteImportWithPreview(buffer: ArrayBuffer): {
  rows: ClientImportPreviewRow[];
  summary: string;
} {
  const wb = XLSX.read(buffer, { type: "array" });
  const nombreRegional = buscarNombreHojaRegionalIiiee(wb);

  if (nombreRegional) {
    const sheet = wb.Sheets[nombreRegional];
    const matrix = XLSX.utils.sheet_to_json<Array<unknown>>(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
    }) as unknown[][];
    if (matrix.length < 2) {
      throw new Error(`La hoja «${nombreRegional}» solo tiene cabeceras: agrega filas de datos IIEE o revisa la hoja elegida por el programa.`);
    }
    const headers = (matrix[0] ?? []).map((c) => String(c));
    const iUgel = columnIndex(headers, "ugel");
    const iIieeCk = columnIndex(headers, "iiee");
    if (iUgel < 0 && iIieeCk < 0 && columnIndexExact(headers, "nombre") < 0 && columnIndex(headers, "codigo") < 0) {
      throw new Error(
        `La hoja «${nombreRegional}» no coincide con el esquema IIEE regional esperado (faltan UGEL, IIEE, NOMBRE institución o CÓDIGO).`,
      );
    }
    const rowsRaw = parseRegionalIiieeMatrix(matrix);
    return {
      rows: rowsRaw,
      summary: `Encontramos ${rowsRaw.length} colegios en la parte del archivo llamada «${nombreRegional}». Cada línea será un cliente.`,
    };
  }

  const plantillaRows = parseClientesImportWorkbook(buffer).map(
    (r): ClientImportPreviewRow => ({
      ...r,
      importSource: "plantilla",
    }),
  );

  return {
    rows: plantillaRows,
    summary:
      plantillaRows.length === 1
        ? "Hay 1 fila lista en la primera pestaña del archivo (plantilla corta)."
        : `Hay ${plantillaRows.length} filas listas en la primera pestaña del archivo (plantilla corta).`,
  };
}

function parseActivo(raw: unknown): boolean {
  if (raw === null || raw === undefined || raw === "") return true;
  const s = String(raw).trim().toLowerCase();
  if (!s) return true;
  if (["si", "sí", "s", "1", "true", "yes", "activo"].includes(s)) return true;
  if (["no", "n", "0", "false", "inactivo"].includes(s)) return false;
  return true;
}

/** Lee la primera hoja; primera fila = cabeceras. */
export function parseClientesImportWorkbook(buffer: ArrayBuffer): ParsedClienteImportRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const name = wb.SheetNames[0];
  if (!name) throw new Error("El archivo no contiene ninguna hoja.");
  const sheet = wb.Sheets[name];
  const matrix = XLSX.utils.sheet_to_json<Array<unknown>>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  }) as unknown[][];
  if (matrix.length < 2) throw new Error("El archivo debe tener encabezados y al menos una fila de datos.");

  const headers = (matrix[0] ?? []).map((c) => String(c));
  const iNombre = columnIndex(headers, "nombre", "cliente", "razon social", "nombre cliente");
  if (iNombre < 0) {
    throw new Error('No se encontró la columna "NOMBRE" (requerido). Descarga la plantilla para ver el formato.');
  }
  const iEmail = columnIndex(headers, "email", "correo");
  const iTel = columnIndex(headers, "telefono", "teléfono", "celular");
  const iActivo = columnIndex(headers, "activo", "activa", "habilitado");

  const out: ParsedClienteImportRow[] = [];

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r] ?? [];
    const nombre = String(row[iNombre] ?? "").trim();
    if (!nombre) continue;
    const rawActivo =
      iActivo >= 0 ? row[iActivo] : undefined;

    out.push({
      nombre,
      email: (() => {
        const t = String(iEmail >= 0 ? row[iEmail] : "").trim();
        return t ? t : undefined;
      })(),
      telefono: (() => {
        const t = String(iTel >= 0 ? row[iTel] : "").trim();
        return t ? t : undefined;
      })(),
      activo: parseActivo(rawActivo),
      rowIndex: r,
    });
  }

  return out;
}

/** Máximo de filas por petición al endpoint de importación en lote (alineado al backend). */
export const CLIENTES_IMPORT_CHUNK_ROWS = 2000;

export function importPreviewRowToWriteBody(r: ClientImportPreviewRow): ClientWriteBody {
  return {
    nombre: r.nombre,
    email: r.email ?? null,
    telefono: r.telefono ?? null,
    nombreApellidosDirectorIiee: r.nombreApellidosDirectorIiee ?? null,
    activo: r.activo,
    codigoRegional: r.codigoRegional ?? null,
    departamento: r.departamento ?? null,
    provincia: r.provincia ?? null,
    distrito: r.distrito ?? null,
    ugel: r.ugel ?? null,
    centroPoblado: r.centroPoblado ?? null,
    direccion: r.direccion ?? null,
    codigoModularIiee: r.codigoModularIiee ?? null,
    nivelEducacion: r.importSource === "regional-iiiee" ? (r.nivel ?? null) : null,
  };
}
