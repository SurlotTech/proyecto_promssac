export interface OrderProductRow {
  id: string;
  code: string;
  orderId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  weight?: number;
  customField: string;
  createdAt: string;
}
