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

export async function apiPut<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: "PUT",
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
