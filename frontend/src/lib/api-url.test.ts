import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("apiUrl", () => {
  it("uses the configured API domain for requests and attachments", async () => {
    vi.stubEnv("VITE_API_BASE", "https://api-promssac.sulortech.com/");
    const { apiUrl } = await import("./api-url");
    expect(apiUrl("/api/v1/auth/login")).toBe("https://api-promssac.sulortech.com/api/v1/auth/login");
    expect(apiUrl("api/v1/files/comentarios/test.pdf")).toBe("https://api-promssac.sulortech.com/api/v1/files/comentarios/test.pdf");
  });

  it("keeps signed MinIO URLs unchanged", async () => {
    vi.stubEnv("VITE_API_BASE", "https://api-promssac.sulortech.com");
    const { apiUrl } = await import("./api-url");
    const signed = "https://minio.example.com/bucket/test.pdf?X-Amz-Signature=abc";
    expect(apiUrl(signed)).toBe(signed);
  });

  it("uses the local Vite proxy when no API base is configured", async () => {
    vi.stubEnv("VITE_API_BASE", "");
    const { apiUrl } = await import("./api-url");
    expect(apiUrl("/api/v1/enlace/ORD-1")).toBe("/api/v1/enlace/ORD-1");
  });

  it("uses the same API base for SockJS", async () => {
    vi.stubEnv("VITE_API_BASE", "https://api-promssac.sulortech.com");
    const { apiUrl } = await import("./api-url");
    expect(apiUrl("/ws?token=test")).toBe("https://api-promssac.sulortech.com/ws?token=test");
  });
});
