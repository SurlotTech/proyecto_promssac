import { apiUrl } from "./api-url";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

function jsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...authHeaders() };
}

function handleUnauthorized(errorMsg: string) {
  const isSessionTerminated = errorMsg.includes("Sesion finalizada")
    || errorMsg.includes("otro usuario");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  const reason = isSessionTerminated ? "session_terminated" : "token_expired";
  window.location.href = `/login?reason=${reason}`;
}

async function checkResponse(res: Response): Promise<void> {
  if (!res.ok) {
    const msg = await parseError(res);
    if (res.status === 401) {
      handleUnauthorized(msg);
      throw new Error(msg);
    }
    throw new Error(msg);
  }
}

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
  const res = await fetch(apiUrl(path), { headers: authHeaders() });
  await checkResponse(res);
  return res.json() as Promise<T>;
}

export async function apiPost<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  await checkResponse(res);
  return res.json() as Promise<T>;
}

export async function apiPostNoContent<B>(path: string, body: B): Promise<void> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  await checkResponse(res);
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
  const res = await fetch(apiUrl(path), { method, body: fd, headers: authHeaders() });
  await checkResponse(res);
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
  const res = await fetch(apiUrl(path), {
    method: "PUT",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  await checkResponse(res);
  return res.json() as Promise<T>;
}

export async function apiPatch<B>(path: string, body: B): Promise<void> {
  const res = await fetch(apiUrl(path), {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  await checkResponse(res);
}

export async function apiPatchJson<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  await checkResponse(res);
  return res.json() as Promise<T>;
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(apiUrl(path), { method: "DELETE", headers: authHeaders() });
  await checkResponse(res);
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  await checkResponse(res);
  return res.json() as Promise<T>;
}
