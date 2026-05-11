const base = import.meta.env.VITE_API_BASE ?? "";

async function parseError(res: Response): Promise<string> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
  const j = body as { error?: string };
  if (j?.error) return j.error;
  return res.statusText || `HTTP ${res.status}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiPost<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

/** POST que responde 204 No Content sin cuerpo JSON. */
export async function apiPostNoContent<B>(path: string, body: B): Promise<void> {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

async function fetchMultipartJson<T>(
  method: "POST" | "PUT",
  path: string,
  jsonPartName: string,
  jsonBody: unknown,
  filePartName: string,
  file: File | null | undefined,
): Promise<T> {
  const fd = new FormData();
  fd.append(jsonPartName, new Blob([JSON.stringify(jsonBody)], { type: "application/json" }));
  if (file) fd.append(filePartName, file);
  const res = await fetch(`${base}${path}`, { method, body: fd });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export function apiPostMultipartJson<T>(
  path: string,
  jsonPartName: string,
  jsonBody: unknown,
  filePartName: string,
  file: File | null | undefined,
): Promise<T> {
  return fetchMultipartJson<T>("POST", path, jsonPartName, jsonBody, filePartName, file);
}

export function apiPutMultipartJson<T>(
  path: string,
  jsonPartName: string,
  jsonBody: unknown,
  filePartName: string,
  file: File | null | undefined,
): Promise<T> {
  return fetchMultipartJson<T>("PUT", path, jsonPartName, jsonBody, filePartName, file);
}

export async function apiPut<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

/** PATCH con JSON; acepta 204 sin cuerpo. */
export async function apiPatch<B>(path: string, body: B): Promise<void> {
  const res = await fetch(`${base}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

/** PATCH esperando respuesta JSON. */
export async function apiPatchJson<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${base}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseError(res));
}
