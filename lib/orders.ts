import { api } from "@/lib/api";

export async function getAdminOrders(params: any) {
  const res = await api.get("/orders", { params });
  return res.data;
}