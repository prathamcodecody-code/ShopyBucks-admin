import { api } from "@/lib/api";

export async function getAdminProducts(params: Record<string, any>) {
  const res = await api.get("/admin/products", {
    params,
  });

  return res.data;
}