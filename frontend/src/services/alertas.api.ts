import { apiGet, apiPut } from "@/lib/api";

export interface AlertaConfig {
  id: string;
  alertaEntregado: boolean;
  alertaDemora: boolean;
  demoraMinutos: number;
}

export const alertasApi = {
  getConfig(): Promise<AlertaConfig> {
    return apiGet<AlertaConfig>("/api/v1/alertas/config");
  },

  updateConfig(body: Partial<AlertaConfig>): Promise<AlertaConfig> {
    return apiPut<AlertaConfig, Partial<AlertaConfig>>("/api/v1/alertas/config", body);
  },
};
