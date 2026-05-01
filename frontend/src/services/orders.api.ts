import type { Order } from "@/domain/orders";
import { apiGet } from "@/lib/api";
import { endpoints } from "./endpoints";

export const ordersApi = {
  list(): Promise<Order[]> {
    return apiGet<Order[]>(endpoints.orders);
  },
};
