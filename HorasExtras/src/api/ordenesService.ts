import { api } from "./api";
import type { OrdenCompra } from "../types/ordenes";

export const ordenesService = {
  async getAll(): Promise<OrdenCompra[]> {
    const res = await api.get<OrdenCompra[]>("/ordenescompra");
    return res.data;
  },
};