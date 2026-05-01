import type { Route } from "@/domain/routes";
import { apiGet } from "@/lib/api";
import { endpoints } from "./endpoints";

export const routesApi = {
  list(): Promise<Route[]> {
    return apiGet<Route[]>(endpoints.routes);
  },
};
