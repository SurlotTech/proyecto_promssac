import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("apiGetBlob", () => {
  it("sends the session and cancellation signal for a private photo", async () => {
    vi.stubEnv("VITE_API_BASE", "https://api-promssac.sulortech.com");
    vi.stubGlobal("localStorage", { getItem: () => "test-token" });
    const photo = new Blob(["photo"], { type: "image/png" });
    const fetch = vi.fn().mockResolvedValue({ ok: true, blob: async () => photo });
    vi.stubGlobal("fetch", fetch);
    const { apiGetBlob } = await import("./api");
    const controller = new AbortController();

    expect(await apiGetBlob("/api/v1/usuarios-movil/id/foto", controller.signal)).toBe(photo);
    expect(fetch).toHaveBeenCalledWith("https://api-promssac.sulortech.com/api/v1/usuarios-movil/id/foto", {
      headers: { Authorization: "Bearer test-token" }, signal: controller.signal,
    });
  });

  it("does not turn an API error into an image", async () => {
    vi.stubGlobal("localStorage", { getItem: () => "test-token" });
    const blob = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({ error: "Foto no encontrada" }), blob }));
    const { apiGetBlob } = await import("./api");

    await expect(apiGetBlob("/api/v1/usuarios-movil/id/foto")).rejects.toThrow("Foto no encontrada");
    expect(blob).not.toHaveBeenCalled();
  });
});
