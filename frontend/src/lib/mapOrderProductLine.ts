import type { OrderProductRow } from "@/domain/orderProducts";
import type { OrderProductLineDto } from "@/services/orders.api";

export function mapOrderProductLineDtoToRow(dto: OrderProductLineDto): OrderProductRow {
  return {
    id: dto.id,
    code: dto.code,
    orderId: dto.orderId,
    name: dto.name,
    unitPrice: dto.unitPrice,
    quantity: dto.quantity,
    weight: dto.weight,
    customField: dto.customField,
    createdAt: dto.createdAt,
  };
}
