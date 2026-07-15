import XLSX from "xlsx-js-style";
import type { Route, RouteOrder } from "@/domain/routes";
import type { OrderProductLineDto } from "@/services/orders.api";

export interface RouteOrderImportRow {
  codigoRuta: string;
  nombreRuta: string;
  placaVehiculo: string;
  fechaInicio: string;
  fechaFin: string;
  numeroOrden: string;
  estadoOrden: string;
  subestado: string;
  tipoIdentificador: string;
  contactoIdentificador: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
  nivel: string;
  direccion: string;
  direccionNormalizada: string;
  fechaEntrega: string;
  modoEntrega: string;
  prioridadEntrega: string;
  director: string;
  telefonoDirector: string;
  paquetes: string;
  actaEntrega: string;
  guiaRemision: string;
  guiaTransportista: string;
  correoElectronico: string;
  productoCodigo: string;
  productoNombre: string;
  productoCantidad: string;
  productoPrecioUnit: string;
  productoPesoKg: string;
  productoCampoExtra: string;
}

export interface RouteOrderImportPreview {
  rows: RouteOrderImportRow[];
  total: number;
  rutasUnicas: number;
  ordenes: number;
}

const PLANTILLA_HEADERS = [
  "Código ruta", "Nombre ruta", "Placa vehículo",
  "Fecha inicio", "Fecha fin",
  "N° orden", "Estado orden", "Subestado",
  "Tipo ident.", "Identificador", "Contacto nombre",
  "Contacto teléfono", "Contacto email", "Nivel",
  "Dirección", "Dirección normalizada", "Fecha de entrega",
  "Modo entrega", "Prioridad entrega",
  "Director", "Teléfono director", "Paquetes",
  "Acta de entrega", "Guía de remisión", "Guía de transportista",
  "Correo electrónico",
  "Producto código", "Producto nombre", "Producto cantidad",
  "Producto precio unit.", "Producto peso (kg)", "Producto campo extra",
];

const FIELD_MAP: Record<string, keyof RouteOrderImportRow> = {
  "codigo ruta": "codigoRuta",
  "nombre ruta": "nombreRuta",
  "placa vehiculo": "placaVehiculo",
  "placa": "placaVehiculo",
  "fecha inicio": "fechaInicio",
  "fecha fin": "fechaFin",
  "n orden": "numeroOrden",
  "numero orden": "numeroOrden",
  "estado orden": "estadoOrden",
  "subestado": "subestado",
  "tipo ident": "tipoIdentificador",
  "tipo identificador": "tipoIdentificador",
  "identificador": "contactoIdentificador",
  "contacto nombre": "contactoNombre",
  "contacto telefono": "contactoTelefono",
  "telefono": "contactoTelefono",
  "contacto email": "contactoEmail",
  "email": "contactoEmail",
  "correo": "contactoEmail",
  "nivel": "nivel",
  "direccion": "direccion",
  "direccion normalizada": "direccionNormalizada",
  "fecha de entrega": "fechaEntrega",
  "fecha entrega": "fechaEntrega",
  "modo entrega": "modoEntrega",
  "prioridad entrega": "prioridadEntrega",
  "director": "director",
  "telefono director": "telefonoDirector",
  "paquetes": "paquetes",
  "acta de entrega": "actaEntrega",
  "acta entrega": "actaEntrega",
  "guia de remision": "guiaRemision",
  "guia remision": "guiaRemision",
  "guia de transportista": "guiaTransportista",
  "guia transportista": "guiaTransportista",
  "correo electronico": "correoElectronico",
  "email director": "correoElectronico",
  "producto codigo": "productoCodigo",
  "producto nombre": "productoNombre",
  "producto cantidad": "productoCantidad",
  "producto precio unitario": "productoPrecioUnit",
  "producto precio unit": "productoPrecioUnit",
  "producto peso kg": "productoPesoKg",
  "producto peso": "productoPesoKg",
  "producto campo extra": "productoCampoExtra",
  "producto campo": "productoCampoExtra",
};

const ESTADOS = "Pendiente,En ruta,Entregado,No entregado";
const SUBESTADOS = "Pendiente,valor,En ruta,Entrega tercero,Entrega UGEL,Recepcionado conforme,Devolucion";

function normalize(h: string): string {
  return h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").trim();
}

function excelDateSerialToIso(serial: number): string {
  const utc = Math.round((serial - 25569) * 86400 * 1000);
  return new Date(utc).toISOString().slice(0, 10);
}

function cellToString(value: string | number | null, field: keyof RouteOrderImportRow): string {
  if (value == null) return "";
  if (typeof value === "number" && ["fechaInicio", "fechaFin", "fechaEntrega"].includes(field)) {
    return excelDateSerialToIso(value);
  }
  return String(value).trim();
}

const SAMPLE_DATA: (string | number)[][] = [
  [
    "RUTA-001", "Ruta Lima Centro", "ABC-123", "2026-05-30", "2026-05-31",
    "ORD-2026-001", "Pendiente", "Pendiente", "DNI", "12345678",
    "Juan Pérez", "987654321", "juan@ejemplo.pe", "primaria",
    "Institución Educativa No. 40458",
    "Institución Educativa No. 40458",
    "2026-05-30", "express", "alta",
    "Pedro Ramírez", "998877665", "10 cajas", "ACTA-001", "GR-001", "GT-001", "",
    "PROD-001", "Laptop HP", "2", "2500.00", "3.5", "Garantía 1 año",
  ],
  [
    "RUTA-001", "Ruta Lima Centro", "ABC-123", "2026-05-30", "2026-05-31",
    "ORD-2026-001", "Pendiente", "por cobrar", "DNI", "12345678",
    "Juan Pérez", "987654321", "juan@ejemplo.pe", "primaria",
    "Institución Educativa No. 40458",
    "Institución Educativa No. 40458",
    "2026-05-30", "express", "alta",
    "Pedro Ramírez", "998877665", "10 cajas", "ACTA-001", "GR-001", "GT-001", "",
    "PROD-002", "Monitor Dell", "1", "1200.00", "5.0", "",
  ],
  [
    "RUTA-002", "Ruta Miraflores", "XYZ-789", "2026-05-31", "2026-06-01",
    "ORD-2026-002", "Entregado", "Recepcionado conforme", "RUC", "20123456789",
    "Carlos Ruiz", "999888777", "carlos@ejemplo.pe", "secundaria",
    "Institución Educativa No. 40125",
    "Institución Educativa No. 40125",
    "2026-05-31", "consolidado", "baja",
    "", "", "5 paquetes", "", "", "", "",
    "PROD-003", "Impresora", "1", "850.00", "8.2", "",
  ],
];

const EMPTY_ROW: RouteOrderImportRow = {
  codigoRuta: "", nombreRuta: "", placaVehiculo: "", fechaInicio: "",
  fechaFin: "", numeroOrden: "", estadoOrden: "",
  subestado: "", tipoIdentificador: "", contactoIdentificador: "",
  contactoNombre: "", contactoTelefono: "", contactoEmail: "",
  nivel: "", direccion: "", direccionNormalizada: "", fechaEntrega: "",
  modoEntrega: "", prioridadEntrega: "", director: "", telefonoDirector: "",
  paquetes: "", actaEntrega: "", guiaRemision: "", guiaTransportista: "",
  correoElectronico: "",
  productoCodigo: "", productoNombre: "", productoCantidad: "",
  productoPrecioUnit: "", productoPesoKg: "", productoCampoExtra: "",
};

const COL_WIDTHS: Record<string, number> = {
  "Dirección": 40, "Email": 28, "Nombre": 24, "nombre": 24,
  "Producto": 20, "Guía": 18, "Acta": 16, "campo": 16,
};

function colWch(h: string): { wch: number } {
  for (const [k, v] of Object.entries(COL_WIDTHS)) {
    if (h.includes(k)) return { wch: v };
  }
  return { wch: 13 };
}

export function downloadExportXlsx(rows: (string | number | null | undefined)[][], filename: string) {
  const wsData = [PLANTILLA_HEADERS.map(String), ...rows.map((row) => PLANTILLA_HEADERS.map((_, i) => {
    const v = row[i];
    return v != null ? String(v) : "";
  }))];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  styleSheet(ws, PLANTILLA_HEADERS.length, wsData.length);

  ws["!dataValidation"] = [
    { type: "list", allowBlank: true, formula1: `"${ESTADOS}"`, sqref: "I2:I1000" },
    { type: "list", allowBlank: true, formula1: `"${SUBESTADOS}"`, sqref: "J2:J1000" },
  ];
  ws["!cols"] = PLANTILLA_HEADERS.map(colWch);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rutas y Órdenes");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPlantillaRutasYOrdenes() {
  downloadExportXlsx(SAMPLE_DATA, "plantilla_rutas_y_ordenes.xlsx");
}

export function parseRouteOrderImport(buffer: ArrayBuffer): RouteOrderImportPreview {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  if (raw.length < 2) return { rows: [], total: 0, rutasUnicas: 0, ordenes: 0 };

  const headerRow = raw[0].map((h) => (h != null ? String(h) : ""));
  const fieldIndex: (keyof RouteOrderImportRow | null)[] = headerRow.map((h) => FIELD_MAP[normalize(h)] ?? null);

  const rows: RouteOrderImportRow[] = [];
  for (let r = 1; r < raw.length; r++) {
    const dataRow = raw[r];
    if (!dataRow || dataRow.every((v) => v == null || String(v).trim() === "")) continue;

    const row: RouteOrderImportRow = { ...EMPTY_ROW };
    for (let c = 0; c < fieldIndex.length; c++) {
      const field = fieldIndex[c];
      if (!field) continue;
      row[field] = cellToString(dataRow[c], field);
    }
    rows.push(row);
  }

  const rutasSet = new Set(rows.map((r) => r.codigoRuta).filter(Boolean));
  const ordenesSet = new Set(rows.map((r) => r.numeroOrden).filter(Boolean));
  return { rows, total: rows.length, rutasUnicas: rutasSet.size, ordenes: ordenesSet.size };
}

function styleSheet(ws: XLSX.WorkSheet, colCount: number, rowCount: number) {
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      const cell = ws[ref];
      if (!cell) continue;
      cell.s = r === 0
        ? { font: { bold: true, color: { rgb: "FFFFFF" }, sz: 9 }, fill: { fgColor: { rgb: "1D4ED8" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true } }
        : { font: { sz: 10 }, alignment: { vertical: "center" } };
    }
  }
}
